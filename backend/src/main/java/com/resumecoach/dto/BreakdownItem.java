package com.resumecoach.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreakdownItem {
    private String question;
    private String category;
    private String answer;
    private int score;
    private String feedback;
}
