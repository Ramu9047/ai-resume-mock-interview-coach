package com.resumecoach.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.List;

/**
 * MongoDB document for a user-authored resume draft created in the Resume Builder.
 * Stored in the {@code resumes} collection, separate from analysis sessions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resumes")
public class ResumeDocument {

    @Id
    private String id;

    /** Public-facing UUID used in API paths and localStorage. */
    @Indexed(unique = true)
    private String resumeId;

    /** Optional link to an analysis session this draft was pre-filled from. */
    private String sessionId;

    /** Template name: "meridian" | "slatepro" | "apex" */
    private String templateId;

    private PersonalInfo personalInfo;
    private String summary;
    private List<Education> education;
    private List<Experience> experience;
    private List<String> skills;
    private List<Project> projects;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    // ── Nested value objects ──────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PersonalInfo {
        private String name;
        private String email;
        private String phone;
        private String location;
        private String linkedin;
        private String portfolio;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Education {
        private String institution;
        private String degree;
        private String field;
        private String year;
        private String gpa;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Experience {
        private String company;
        private String role;
        private String duration;
        private List<String> bullets;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Project {
        private String name;
        private String description;
        private String tech;
        private String url;
    }
}
