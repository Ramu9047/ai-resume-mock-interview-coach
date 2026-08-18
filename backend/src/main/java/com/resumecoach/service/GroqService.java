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
    private final String apiKey;

    public GroqService(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.base-url}") String baseUrl,
            @Value("${groq.model}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model;
        this.objectMapper = objectMapper;
        log.info("[GROQ DIAGNOSTIC] GroqService initialized: apiKey isBlank={} length={} keyPrefix='{}' baseUrl={} model={}",
            this.apiKey.isBlank(),
            this.apiKey.length(),
            this.apiKey.length() > 6 ? this.apiKey.substring(0, 6) + "..." : this.apiKey,
            baseUrl, model);
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer " + this.apiKey)
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader("User-Agent", "ResumeCoachAI/1.0")
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
     * Iterates through primary model and an active fallback list to prevent decommission errors.
     */
    public String chat(String systemPrompt, String userMessage, boolean isJson) {
        List<String> modelCandidates = List.of(
            this.model,
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "qwen/qwen3.6-27b"
        );

        Exception lastException = null;
        for (String targetModel : modelCandidates) {
            if (targetModel == null || targetModel.isBlank()) continue;
            try {
                return executeChat(targetModel, systemPrompt, userMessage, isJson);
            } catch (Exception e) {
                lastException = e;
                log.warn("[GROQ RETRY] Model '{}' failed ({}). Trying next available model candidate...", targetModel, e.getMessage());
            }
        }
        if (lastException instanceof GroqApiException gae) {
            throw gae;
        }
        throw new GroqApiException("All Groq model candidates failed: " + (lastException != null ? lastException.getMessage() : "Unknown error"));
    }

    private String executeChat(String targetModel, String systemPrompt, String userMessage, boolean isJson) {
        if (this.apiKey.isBlank()) {
            log.error("[GROQ ERROR] GROQ_API_KEY environment variable is not configured or is blank on backend server!");
            throw new GroqApiException("GROQ_API_KEY environment variable is missing or blank on Render server.");
        }

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
                if (res.getStatusCode().value() == 401) {
                    throw new GroqApiException("GROQ_API_KEY is invalid or unauthorized (401). Please check your key in Render environment variables.");
                }
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
