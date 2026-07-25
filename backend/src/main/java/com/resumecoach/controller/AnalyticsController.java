package com.resumecoach.controller;

import com.resumecoach.dto.*;
import com.resumecoach.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal-only analytics endpoints consumed by the Admin Dashboard.
 * No auth for v1 — route is unlisted and unguessable from public nav.
 */
@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** GET /api/analytics/overview — total sessions, avg ATS score, total drafts */
    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> overview() {
        log.info("GET /api/analytics/overview");
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    /** GET /api/analytics/ats-over-time — daily ATS avg for last 30 days */
    @GetMapping("/ats-over-time")
    public ResponseEntity<List<AtsOverTimeDto>> atsOverTime() {
        log.info("GET /api/analytics/ats-over-time");
        return ResponseEntity.ok(analyticsService.getAtsOverTime());
    }

    /** GET /api/analytics/top-gaps — top 10 most frequent skill gaps */
    @GetMapping("/top-gaps")
    public ResponseEntity<List<TopGapDto>> topGaps() {
        log.info("GET /api/analytics/top-gaps");
        return ResponseEntity.ok(analyticsService.getTopGaps());
    }

    /** GET /api/analytics/top-jd-keywords — top 15 keywords across all job descriptions */
    @GetMapping("/top-jd-keywords")
    public ResponseEntity<List<TopKeywordDto>> topJdKeywords() {
        log.info("GET /api/analytics/top-jd-keywords");
        return ResponseEntity.ok(analyticsService.getTopJdKeywords());
    }
}
