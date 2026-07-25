package com.resumecoach.controller;

import com.resumecoach.dto.*;
import com.resumecoach.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    /**
     * POST /api/interview/generate-questions
     * Body: { "sessionId": "..." }
     */
    @PostMapping("/generate-questions")
    public ResponseEntity<GenerateQuestionsResponse> generateQuestions(
            @RequestBody Map<String, String> body) {

        String sessionId = body.get("sessionId");
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("POST /api/interview/generate-questions sessionId={}", sessionId);
        GenerateQuestionsResponse response = interviewService.generateQuestions(sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/interview/submit-answer
     * Body: { sessionId, questionId, answer }
     */
    @PostMapping("/submit-answer")
    public ResponseEntity<SubmitAnswerResponse> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request) {

        log.info("POST /api/interview/submit-answer sessionId={} questionId={}",
            request.getSessionId(), request.getQuestionId());
        SubmitAnswerResponse response = interviewService.submitAnswer(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interview/summary/{sessionId}
     */
    @GetMapping("/summary/{sessionId}")
    public ResponseEntity<SummaryResponse> getSummary(@PathVariable String sessionId) {
        log.info("GET /api/interview/summary/{}", sessionId);
        SummaryResponse response = interviewService.getSummary(sessionId);
        return ResponseEntity.ok(response);
    }
}
