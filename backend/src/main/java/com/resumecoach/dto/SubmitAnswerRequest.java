package com.resumecoach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {

    @NotBlank(message = "sessionId is required")
    private String sessionId;

    @NotBlank(message = "questionId is required")
    private String questionId;

    @NotBlank(message = "answer is required")
    private String answer;
}
