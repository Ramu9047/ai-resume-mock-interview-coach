package com.resumecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "sessions")
public class Session {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sessionId;

    private String resumeText;
    private String jobDescription;

    private int atsScore;
    private int formattingScore;
    private int keywordMatchScore;
    private int experienceRelevanceScore;
    private int skillsAlignmentScore;
    private List<String> strengths;
    private List<String> gaps;
    private List<String> suggestions;

    /** Keyword frequency list extracted from the job description text. */
    private List<KeywordEntry> jdKeywords;

    /** Keyword frequency list extracted from the resume text. */
    private List<KeywordEntry> resumeKeywords;

    /** Questions generated during the mock interview phase. */
    private List<Question> questions;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
