package com.resumecoach.controller;

import com.resumecoach.dto.AnalyzeResponse;
import com.resumecoach.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    /**
     * POST /api/resume/analyze
     * Accepts a resume PDF (required) and optional job description text.
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalyzeResponse> analyze(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "jobDescription", required = false) String jobDescription)
            throws IOException {

        log.info("POST /api/resume/analyze file={} size={}", resume != null ? resume.getOriginalFilename() : "null", resume != null ? resume.getSize() : 0);

        if (resume == null || resume.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Guard: PDF extension or content type
        String filename = resume.getOriginalFilename();
        String contentType = resume.getContentType();
        boolean isPdf = (filename != null && filename.toLowerCase().endsWith(".pdf")) ||
                        (contentType != null && contentType.toLowerCase().contains("pdf"));

        if (!isPdf) {
            return ResponseEntity.badRequest().build();
        }

        AnalyzeResponse response = resumeService.analyzeResume(resume, jobDescription);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/resume/session/{sessionId}
     * Retrieves stored resume analysis by session ID.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<AnalyzeResponse> getSession(@PathVariable("sessionId") String sessionId) {
        log.info("GET /api/resume/session/{}", sessionId);
        try {
            AnalyzeResponse response = resumeService.getSession(sessionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/resume/parse-pdf
     * Parses an uploaded PDF directly into a structured draft for the Resume Builder.
     */
    @PostMapping(value = "/parse-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> parsePdf(@RequestParam("resume") MultipartFile resume) throws IOException {
        log.info("POST /api/resume/parse-pdf file={}", resume != null ? resume.getOriginalFilename() : "null");
        if (resume == null || resume.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file is empty.");
        }
        com.fasterxml.jackson.databind.JsonNode draft = resumeService.parsePdfToDraft(resume);
        return ResponseEntity.ok(draft);
    }

    /**
     * POST /api/resume/improve-field
     * Rewrites a professional summary or experience bullet using Groq LLM.
     */
    @PostMapping("/improve-field")
    public ResponseEntity<?> improveField(@RequestBody ImproveFieldPayload payload) {
        if (payload == null || payload.text() == null || payload.text().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Field text cannot be empty."));
        }
        String suggestion = resumeService.improveField(payload.fieldType(), payload.text());
        return ResponseEntity.ok(java.util.Map.of("suggestion", suggestion));
    }

    public record ImproveFieldPayload(String fieldType, String text) {}
}
