package com.resumecoach.controller;

import com.resumecoach.service.AdminAuthService;
import com.resumecoach.service.AdminAuthService.LoginResult;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public record AdminLoginPayload(String adminKey) {}

    /**
     * POST /api/admin/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) AdminLoginPayload payload, HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String adminKey = payload != null ? payload.adminKey() : null;

        LoginResult result = adminAuthService.login(adminKey, clientIp, userAgent);

        if (result.success()) {
            return ResponseEntity.ok(Map.of("token", result.token()));
        } else if (result.rateLimited()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", result.errorMessage()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", result.errorMessage()));
        }
    }

    /**
     * POST /api/admin/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (token != null) {
            adminAuthService.logout(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    /**
     * GET /api/admin/auth/verify
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        boolean valid = adminAuthService.isValidToken(token);
        if (valid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "error", "Invalid or expired admin token."));
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
