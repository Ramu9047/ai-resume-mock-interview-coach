package com.resumecoach.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

import com.resumecoach.model.KeywordEntry;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResponse {
    private String sessionId;
    private int atsScore;
    private int formattingScore;
    private int keywordMatchScore;
    private int experienceRelevanceScore;
    private int skillsAlignmentScore;
    private List<String> strengths;
    private List<String> gaps;
    private List<String> suggestions;
    private List<KeywordEntry> jdKeywords;
    private List<KeywordEntry> resumeKeywords;
}
