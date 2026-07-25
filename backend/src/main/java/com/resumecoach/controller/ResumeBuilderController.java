package com.resumecoach.controller;

import com.resumecoach.dto.ResumeDocumentDto;
import com.resumecoach.service.ResumeBuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/builder")
@RequiredArgsConstructor
public class ResumeBuilderController {

    private final ResumeBuilderService builderService;

    /**
     * POST /api/builder/resume
     * Creates a new draft if no resumeId is present, or upserts an existing one.
     */
    @PostMapping("/resume")
    public ResponseEntity<ResumeDocumentDto> save(@RequestBody ResumeDocumentDto dto) {
        log.info("POST /api/builder/resume resumeId={}", dto.getResumeId());
        return ResponseEntity.ok(builderService.createOrUpdate(dto));
    }

    /**
     * GET /api/builder/resume/{resumeId}
     * Returns a draft by its public UUID.
     */
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ResumeDocumentDto> get(@PathVariable String resumeId) {
        log.info("GET /api/builder/resume/{}", resumeId);
        return ResponseEntity.ok(builderService.getById(resumeId));
    }

    /**
     * DELETE /api/builder/resume/{resumeId}
     */
    @DeleteMapping("/resume/{resumeId}")
    public ResponseEntity<Void> delete(@PathVariable String resumeId) {
        log.info("DELETE /api/builder/resume/{}", resumeId);
        builderService.delete(resumeId);
        return ResponseEntity.noContent().build();
    }
}
