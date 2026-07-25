package com.resumecoach.service;

import com.resumecoach.dto.ResumeDocumentDto;
import com.resumecoach.model.ResumeDocument;
import com.resumecoach.repository.ResumeDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeBuilderService {

    private final ResumeDocumentRepository repo;

    /** Creates a new draft and returns it with the generated resumeId. */
    public ResumeDocumentDto createOrUpdate(ResumeDocumentDto dto) {
        ResumeDocument doc;

        if (dto.getResumeId() != null && !dto.getResumeId().isBlank()
                && repo.existsByResumeId(dto.getResumeId())) {
            // Update existing
            doc = repo.findByResumeId(dto.getResumeId()).orElseThrow();
            doc.setUpdatedAt(Instant.now());
        } else {
            // Create new
            doc = ResumeDocument.builder()
                    .resumeId(UUID.randomUUID().toString())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
        }

        applyDto(dto, doc);
        repo.save(doc);
        log.info("Saved resume draft resumeId={}", doc.getResumeId());
        return toDto(doc);
    }

    /** Fetches a draft by its public resumeId. */
    public ResumeDocumentDto getById(String resumeId) {
        return repo.findByResumeId(resumeId)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Resume draft not found: " + resumeId));
    }

    /** Deletes a draft. Silently ignores unknown IDs. */
    public void delete(String resumeId) {
        if (repo.existsByResumeId(resumeId)) {
            repo.deleteByResumeId(resumeId);
            log.info("Deleted resume draft resumeId={}", resumeId);
        }
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private void applyDto(ResumeDocumentDto dto, ResumeDocument doc) {
        doc.setSessionId(dto.getSessionId());
        doc.setTemplateId(dto.getTemplateId() != null ? dto.getTemplateId() : "meridian");
        doc.setSummary(dto.getSummary());
        doc.setSkills(dto.getSkills());

        if (dto.getPersonalInfo() != null) {
            var pi = dto.getPersonalInfo();
            doc.setPersonalInfo(ResumeDocument.PersonalInfo.builder()
                    .name(pi.getName()).email(pi.getEmail()).phone(pi.getPhone())
                    .location(pi.getLocation()).linkedin(pi.getLinkedin())
                    .portfolio(pi.getPortfolio()).build());
        }

        if (dto.getEducation() != null) {
            doc.setEducation(dto.getEducation().stream().map(e ->
                ResumeDocument.Education.builder()
                    .institution(e.getInstitution()).degree(e.getDegree())
                    .field(e.getField()).year(e.getYear()).gpa(e.getGpa()).build()
            ).collect(Collectors.toList()));
        }

        if (dto.getExperience() != null) {
            doc.setExperience(dto.getExperience().stream().map(e ->
                ResumeDocument.Experience.builder()
                    .company(e.getCompany()).role(e.getRole())
                    .duration(e.getDuration()).bullets(e.getBullets()).build()
            ).collect(Collectors.toList()));
        }

        if (dto.getProjects() != null) {
            doc.setProjects(dto.getProjects().stream().map(p ->
                ResumeDocument.Project.builder()
                    .name(p.getName()).description(p.getDescription())
                    .tech(p.getTech()).url(p.getUrl()).build()
            ).collect(Collectors.toList()));
        }
    }

    private ResumeDocumentDto toDto(ResumeDocument doc) {
        var b = ResumeDocumentDto.builder()
                .resumeId(doc.getResumeId())
                .sessionId(doc.getSessionId())
                .templateId(doc.getTemplateId())
                .summary(doc.getSummary())
                .skills(doc.getSkills())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt());

        if (doc.getPersonalInfo() != null) {
            var pi = doc.getPersonalInfo();
            b.personalInfo(ResumeDocumentDto.PersonalInfoDto.builder()
                    .name(pi.getName()).email(pi.getEmail()).phone(pi.getPhone())
                    .location(pi.getLocation()).linkedin(pi.getLinkedin())
                    .portfolio(pi.getPortfolio()).build());
        }

        if (doc.getEducation() != null) {
            b.education(doc.getEducation().stream().map(e ->
                ResumeDocumentDto.EducationDto.builder()
                    .institution(e.getInstitution()).degree(e.getDegree())
                    .field(e.getField()).year(e.getYear()).gpa(e.getGpa()).build()
            ).collect(Collectors.toList()));
        }

        if (doc.getExperience() != null) {
            b.experience(doc.getExperience().stream().map(e ->
                ResumeDocumentDto.ExperienceDto.builder()
                    .company(e.getCompany()).role(e.getRole())
                    .duration(e.getDuration()).bullets(e.getBullets()).build()
            ).collect(Collectors.toList()));
        }

        if (doc.getProjects() != null) {
            b.projects(doc.getProjects().stream().map(p ->
                ResumeDocumentDto.ProjectDto.builder()
                    .name(p.getName()).description(p.getDescription())
                    .tech(p.getTech()).url(p.getUrl()).build()
            ).collect(Collectors.toList()));
        }

        return b.build();
    }
}
