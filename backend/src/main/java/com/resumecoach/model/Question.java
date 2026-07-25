package com.resumecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Embedded document stored inside a Session's questions list.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    private String questionId;
    private String question;
    private String category; // "technical" | "behavioral" | "role-fit"
}
