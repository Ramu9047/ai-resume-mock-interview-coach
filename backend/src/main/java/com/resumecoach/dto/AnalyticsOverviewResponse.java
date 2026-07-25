package com.resumecoach.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnalyticsOverviewResponse {
    private long totalSessions;
    private double avgAtsScore;
    private long totalResumeDrafts;
}
