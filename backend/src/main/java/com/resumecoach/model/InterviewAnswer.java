package com.resumecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "interview_answers")
public class InterviewAnswer {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    private String questionId;
    private String question;
    private String category;
    private String answer;

    private int score;       // 0–10
    private String feedback;

    @Builder.Default
    private Instant answeredAt = Instant.now();
}
