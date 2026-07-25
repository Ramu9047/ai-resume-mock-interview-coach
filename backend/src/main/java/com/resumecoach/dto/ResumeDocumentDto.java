package com.resumecoach.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * Request/response DTO for the Resume Builder — mirrors {@link com.resumecoach.model.ResumeDocument}
 * but without internal MongoDB _id. Used for both create and update payloads.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeDocumentDto {

    private String resumeId;
    private String sessionId;
    private String templateId;
    private PersonalInfoDto personalInfo;
    private String summary;
    private List<EducationDto> education;
    private List<ExperienceDto> experience;
    private List<String> skills;
    private List<ProjectDto> projects;
    private Instant createdAt;
    private Instant updatedAt;

    // ── Nested DTOs ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PersonalInfoDto {
        private String name;
        private String email;
        private String phone;
        private String location;
        private String linkedin;
        private String portfolio;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EducationDto {
        private String institution;
        private String degree;
        private String field;
        private String year;
        private String gpa;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ExperienceDto {
        private String company;
        private String role;
        private String duration;
        private List<String> bullets;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProjectDto {
        private String name;
        private String description;
        private String tech;
        private String url;
    }
}
