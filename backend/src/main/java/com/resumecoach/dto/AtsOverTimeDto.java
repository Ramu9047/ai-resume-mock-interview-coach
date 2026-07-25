package com.resumecoach.dto;

import lombok.*;

/** One data point for the ATS-over-time line chart: a date bucket and its average score. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AtsOverTimeDto {
    /** Date string in ISO format e.g. "2026-07-15" */
    private String date;
    private double avgScore;
    private long sessionCount;
}
