package com.resumecoach.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class AdminAuthService {

    // Dedicated audit logger mapped exclusively to logs/admin_audit.log via Logback appender
    private static final Logger auditLog = LoggerFactory.getLogger("com.resumecoach.audit");

    @Value("${admin.analytics.secret-key:AdminAnalyticsSecret2026!SecureKey}")
    private String adminSecretKey;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000L; // 15 minutes
    private static final long SESSION_TTL_MS = 8 * 60 * 60 * 1000L; // 8 hours

    private static final String STATE_FILE_PATH = "logs/admin_security_state.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory active tokens: SHA256(rawToken) -> expirationTimestamp
    private final ConcurrentHashMap<String, Long> activeTokenHashes = new ConcurrentHashMap<>();

    // Rate limiting: IP -> list of failed attempt timestamps
    private final ConcurrentHashMap<String, List<Long>> failedAttempts = new ConcurrentHashMap<>();

    public record LoginResult(boolean success, String token, String errorMessage, boolean rateLimited) {}

    @PostConstruct
    public void init() {
        loadStateFromDisk();
    }

    /**
     * Authenticates an admin login attempt.
     */
    public LoginResult login(String providedKey, String clientIp, String userAgent) {
        String nowStr = Instant.now().toString();

        // 1. Check rate limit
        if (isRateLimited(clientIp)) {
            auditLog.warn("[ADMIN AUDIT] [{}] IP={} status=RATE_LIMITED userAgent=\"{}\"", nowStr, clientIp, userAgent);
            return new LoginResult(false, null, "Too many failed login attempts. Please try again in 15 minutes.", true);
        }

        // 2. Validate credential with constant-time comparison
        if (!isEqualsConstantTime(providedKey, adminSecretKey)) {
            recordFailedAttempt(clientIp);
            auditLog.warn("[ADMIN AUDIT] [{}] IP={} status=FAILED_INVALID_KEY userAgent=\"{}\"", nowStr, clientIp, userAgent);
            return new LoginResult(false, null, "Invalid admin credential.", false);
        }

        // 3. Success: generate raw token & store SHA-256 hash in memory & disk
        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        String tokenHash = hashToken(rawToken);
        activeTokenHashes.put(tokenHash, System.currentTimeMillis() + SESSION_TTL_MS);

        // Clear failed attempts on successful login
        failedAttempts.remove(clientIp);
        saveStateToDisk();

        auditLog.info("[ADMIN AUDIT] [{}] IP={} status=SUCCESS userAgent=\"{}\"", nowStr, clientIp, userAgent);
        return new LoginResult(true, rawToken, null, false);
    }

    /**
     * Checks if a session token is valid and not expired.
     */
    public boolean isValidToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        String tokenHash = hashToken(rawToken);
        Long expiresAt = activeTokenHashes.get(tokenHash);
        if (expiresAt == null) {
            return false;
        }
        if (System.currentTimeMillis() > expiresAt) {
            activeTokenHashes.remove(tokenHash);
            saveStateToDisk();
            return false;
        }
        return true;
    }

    /**
     * Invalidates a session token (logout).
     */
    public void logout(String rawToken) {
        if (rawToken != null) {
            String tokenHash = hashToken(rawToken);
            activeTokenHashes.remove(tokenHash);
            saveStateToDisk();
        }
    }

    /**
     * Logs unauthorized access attempt to analytics endpoints.
     */
    public void logUnauthorizedAttempt(String path, String clientIp, String userAgent) {
        String nowStr = Instant.now().toString();
        auditLog.warn("[ADMIN AUDIT] [{}] IP={} path={} status=UNAUTHORIZED_ACCESS_DENIED userAgent=\"{}\"",
                nowStr, clientIp, path, userAgent);
    }

    /**
     * Hashes raw token using SHA-256 so plaintext tokens are never stored on disk.
     */
    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    /**
     * Constant-time string comparison using MessageDigest.isEqual to prevent timing attacks.
     */
    private boolean isEqualsConstantTime(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(aBytes, bBytes);
    }

    private boolean isRateLimited(String clientIp) {
        List<Long> timestamps = failedAttempts.get(clientIp);
        if (timestamps == null) return false;

        long now = System.currentTimeMillis();
        long cutoff = now - RATE_LIMIT_WINDOW_MS;

        synchronized (timestamps) {
            timestamps.removeIf(t -> t < cutoff);
            saveStateToDisk();
            return timestamps.size() >= MAX_FAILED_ATTEMPTS;
        }
    }

    private void recordFailedAttempt(String clientIp) {
        long now = System.currentTimeMillis();
        failedAttempts.computeIfAbsent(clientIp, k -> new ArrayList<>());
        List<Long> timestamps = failedAttempts.get(clientIp);
        synchronized (timestamps) {
            timestamps.add(now);
        }
        saveStateToDisk();
    }

    private synchronized void saveStateToDisk() {
        try {
            File dir = new File("logs");
            if (!dir.exists()) {
                dir.mkdirs();
            }
            Map<String, Object> state = new HashMap<>();
            state.put("activeTokenHashes", activeTokenHashes);
            state.put("failedAttempts", failedAttempts);
            objectMapper.writeValue(new File(STATE_FILE_PATH), state);
        } catch (Exception e) {
            log.debug("Could not persist admin security state: {}", e.getMessage());
        }
    }

    private synchronized void loadStateFromDisk() {
        try {
            File file = new File(STATE_FILE_PATH);
            if (!file.exists()) return;

            Map<String, Object> state = objectMapper.readValue(file, new TypeReference<>() {});
            long now = System.currentTimeMillis();
            long cutoff = now - RATE_LIMIT_WINDOW_MS;

            // Restore active token hashes (pruning expired ones)
            Object tokensObj = state.get("activeTokenHashes");
            if (tokensObj instanceof Map<?, ?> map) {
                map.forEach((k, v) -> {
                    if (k != null && v instanceof Number num && num.longValue() > now) {
                        activeTokenHashes.put(k.toString(), num.longValue());
                    }
                });
            }

            // Restore failed attempts (pruning older than window)
            Object attemptsObj = state.get("failedAttempts");
            if (attemptsObj instanceof Map<?, ?> map) {
                map.forEach((k, v) -> {
                    if (k != null && v instanceof List<?> list) {
                        List<Long> validTimestamps = new ArrayList<>();
                        for (Object item : list) {
                            if (item instanceof Number num && num.longValue() >= cutoff) {
                                validTimestamps.add(num.longValue());
                            }
                        }
                        if (!validTimestamps.isEmpty()) {
                            failedAttempts.put(k.toString(), validTimestamps);
                        }
                    }
                });
            }
            log.info("Loaded admin security state from disk: {} active token hashes, {} tracked IPs",
                    activeTokenHashes.size(), failedAttempts.size());
        } catch (Exception e) {
            log.debug("Could not load admin security state: {}", e.getMessage());
        }
    }
}
