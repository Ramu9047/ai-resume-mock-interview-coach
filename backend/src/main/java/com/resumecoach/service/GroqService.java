package com.resumecoach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Wrapper around the Groq chat completions API.
 * Handles prompt construction, HTTP, JSON fence stripping, and error mapping.
 */
@Slf4j
@Service
public class GroqService {

    private static final Pattern JSON_FENCE_PATTERN =
        Pattern.compile("```(?:json)?\\s*(\\{.*?\\})\\s*```", Pattern.DOTALL);

    private final RestClient restClient;
    private final String model;
    private final ObjectMapper objectMapper;

    public GroqService(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.base-url}") String baseUrl,
            @Value("${groq.model}") String model,
            ObjectMapper objectMapper) {
        this.model = model;
        this.objectMapper = objectMapper;
        log.info("[GROQ DIAGNOSTIC] GroqService initialized: apiKey isBlank={} length={} keyPrefix='{}' baseUrl={} model={}",
            apiKey == null || apiKey.isBlank(),
            apiKey != null ? apiKey.length() : 0,
            apiKey != null && apiKey.length() > 6 ? apiKey.substring(0, 6) + "..." : apiKey,
            baseUrl, model);
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    /**
     * Calls Groq with a system + user message pair and returns the raw text content.
     *
     * @param systemPrompt the system-role message
     * @param userMessage  the user-role message
     * @return the assistant's response text
     */
    public String chat(String systemPrompt, String userMessage) {
        return chat(systemPrompt, userMessage, true);
    }

    /**
     * Calls Groq with optional JSON response format enforcement.
     */
    public String chat(String systemPrompt, String userMessage, boolean isJson) {
        try {
            return executeChat(this.model, systemPrompt, userMessage, isJson);
        } catch (GroqApiException e) {
            String fallbackModel = "llama-3.1-8b-instant";
            if (!fallbackModel.equalsIgnoreCase(this.model)) {
                log.warn("[GROQ FALLBACK] Primary model '{}' failed ({}), retrying with '{}'...", this.model, e.getMessage(), fallbackModel);
                try {
                    return executeChat(fallbackModel, systemPrompt, userMessage, isJson);
                } catch (Exception fallbackErr) {
                    log.error("[GROQ FALLBACK FAILED] Fallback model also failed: {}", fallbackErr.getMessage());
                }
            }
            throw e;
        }
    }

    private String executeChat(String targetModel, String systemPrompt, String userMessage, boolean isJson) {
        Map<String, Object> requestBody;
        if (isJson) {
            requestBody = Map.of(
                "model", targetModel,
                "messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user",   "content", userMessage)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.3,
                "max_tokens", 2500
            );
        } else {
            requestBody = Map.of(
                "model", targetModel,
                "messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user",   "content", userMessage)
                ),
                "temperature", 0.3,
                "max_tokens", 500
            );
        }

        long startTime = System.currentTimeMillis();
        log.info("Calling Groq model={} isJson={}...", targetModel, isJson);

        String responseBody = restClient.post()
            .uri("/chat/completions")
            .body(requestBody)
            .retrieve()
            .onStatus(HttpStatusCode::isError, (req, res) -> {
                String body = new String(res.getBody().readAllBytes());
                log.error("Groq API error status={} body={}", res.getStatusCode(), body);
                throw new GroqApiException(
                    "Groq API returned " + res.getStatusCode() + ": " + body
                );
            })
            .body(String.class);

        long duration = System.currentTimeMillis() - startTime;
        log.info("Groq API responded in {} ms (model={})", duration, targetModel);

        return extractContent(responseBody);
    }

    /**
     * Plain-text completion without JSON response formatting.
     */
    public String chatText(String systemPrompt, String userMessage) {
        return chat(systemPrompt, userMessage, false);
    }

    /**
     * Calls Groq and returns the response as a parsed JsonNode.
     * Strips markdown JSON fences if present.
     */
    public JsonNode chatJson(String systemPrompt, String userMessage) {
        String raw = chat(systemPrompt, userMessage);
        String json = stripJsonFences(raw);
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("Failed to parse Groq JSON response. Raw content: {}", raw);
            throw new GroqApiException("Groq returned non-parseable JSON: " + e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private String extractContent(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("Failed to parse Groq wrapper response: {}", responseBody);
            throw new GroqApiException("Could not extract content from Groq response.");
        }
    }

    /**
     * Strips ```json ... ``` or ``` ... ``` markdown fences from a string.
     * Falls back to the original string if no fence is found.
     */
    String stripJsonFences(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.strip();
        Matcher m = JSON_FENCE_PATTERN.matcher(trimmed);
        if (m.find()) {
            return m.group(1).strip();
        }
        // If the entire string looks like JSON already, return as-is
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            return trimmed;
        }
        // Last-ditch: try to extract first {...} block
        int start = trimmed.indexOf('{');
        int end   = trimmed.lastIndexOf('}');
        if (start != -1 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Custom exception
    // ──────────────────────────────────────────────────────────────────────────

    public static class GroqApiException extends RuntimeException {
        public GroqApiException(String message) {
            super(message);
        }
    }
}
