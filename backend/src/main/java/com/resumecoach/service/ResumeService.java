package com.resumecoach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.resumecoach.dto.AnalyzeResponse;
import com.resumecoach.model.KeywordEntry;
import com.resumecoach.model.Session;
import com.resumecoach.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final PdfService pdfService;
    private final GroqService groqService;
    private final SessionRepository sessionRepository;

    private static final String SYSTEM_PROMPT = """
        You are an expert technical recruiter and ATS (Applicant Tracking System) specialist.
        Analyze the following resume against the given job description (if provided).
        Be specific, actionable, and honest.
        Return ONLY valid JSON in this exact format — no preamble, no markdown, no explanation:
        {
          "atsScore": <integer 0-100>,
          "formattingScore": <integer 0-100 (resume structure, section organization, readability)>,
          "keywordMatchScore": <integer 0-100 (overlap with job description terms)>,
          "experienceRelevanceScore": <integer 0-100 (how well work history aligns with the target role)>,
          "skillsAlignmentScore": <integer 0-100 (technical/soft skills match against requirements)>,
          "strengths": ["<specific strength>", "..."],
          "gaps": ["<specific gap>", "..."],
          "suggestions": ["<actionable suggestion>", "..."]
        }
        IMPORTANT: Do NOT output fixed or hardcoded list sizes. The number of items in 'strengths', 'gaps', and 'suggestions' MUST vary naturally (between 3 and 8 items each) based on the actual depth, quality, and specific content of the candidate's resume.
        """;

    /**
     * Analyzes a resume PDF against an optional job description.
     * Stores the resulting session in MongoDB and returns the analysis.
     */
    public AnalyzeResponse analyzeResume(MultipartFile resumeFile, String jobDescription) throws IOException {
        // 1. Extract text from PDF
        String resumeText = pdfService.extractText(resumeFile);
        log.info("Extracted {} chars from PDF", resumeText.length());

        // 2. Build user prompt
        String jd = (jobDescription != null && !jobDescription.isBlank())
            ? jobDescription
            : "General software engineering role — evaluate broadly.";

        String userMessage = """
            Resume text:
            %s

            Job description:
            %s
            """.formatted(resumeText, jd);

        // 3. Call Groq
        long startTime = System.currentTimeMillis();
        JsonNode result = groqService.chatJson(SYSTEM_PROMPT, userMessage);
        long elapsed = System.currentTimeMillis() - startTime;
        log.info("Groq analysis completed in {} ms", elapsed);

        // 4. Parse result defensively
        int atsScore                 = clamp(result.path("atsScore").asInt(50), 0, 100);
        int formattingScore          = clamp(result.path("formattingScore").asInt(atsScore), 0, 100);
        int keywordMatchScore        = clamp(result.path("keywordMatchScore").asInt(atsScore), 0, 100);
        int experienceRelevanceScore = clamp(result.path("experienceRelevanceScore").asInt(atsScore), 0, 100);
        int skillsAlignmentScore     = clamp(result.path("skillsAlignmentScore").asInt(atsScore), 0, 100);

        List<String> strengths   = toStringList(result.path("strengths"));
        List<String> gaps        = toStringList(result.path("gaps"));
        List<String> suggestions = toStringList(result.path("suggestions"));

        List<KeywordEntry> jdKeywords     = KeywordExtractor.extractFrequency(jd);
        List<KeywordEntry> resumeKeywords = KeywordExtractor.extractFrequency(resumeText);

        // 5. Persist session
        String sessionId = UUID.randomUUID().toString();
        Session session = Session.builder()
            .sessionId(sessionId)
            .resumeText(resumeText)
            .jobDescription(jd)
            .atsScore(atsScore)
            .formattingScore(formattingScore)
            .keywordMatchScore(keywordMatchScore)
            .experienceRelevanceScore(experienceRelevanceScore)
            .skillsAlignmentScore(skillsAlignmentScore)
            .strengths(strengths)
            .gaps(gaps)
            .suggestions(suggestions)
            .jdKeywords(jdKeywords)
            .resumeKeywords(resumeKeywords)
            .build();
        sessionRepository.save(session);
        log.info("Saved session sessionId={} atsScore={}", sessionId, atsScore);

        // 6. Return DTO
        return AnalyzeResponse.builder()
            .sessionId(sessionId)
            .atsScore(atsScore)
            .formattingScore(formattingScore)
            .keywordMatchScore(keywordMatchScore)
            .experienceRelevanceScore(experienceRelevanceScore)
            .skillsAlignmentScore(skillsAlignmentScore)
            .strengths(strengths)
            .gaps(gaps)
            .suggestions(suggestions)
            .jdKeywords(jdKeywords)
            .resumeKeywords(resumeKeywords)
            .build();
    }

    /**
     * Retrieves an existing session by sessionId from MongoDB.
     */
    public AnalyzeResponse getSession(String sessionId) {
        Session session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        return AnalyzeResponse.builder()
            .sessionId(session.getSessionId())
            .atsScore(session.getAtsScore())
            .formattingScore(session.getFormattingScore())
            .keywordMatchScore(session.getKeywordMatchScore())
            .experienceRelevanceScore(session.getExperienceRelevanceScore())
            .skillsAlignmentScore(session.getSkillsAlignmentScore())
            .strengths(session.getStrengths())
            .gaps(session.getGaps())
            .suggestions(session.getSuggestions())
            .jdKeywords(session.getJdKeywords())
            .resumeKeywords(session.getResumeKeywords())
            .build();
    }

    /**
     * Parses an uploaded PDF directly into a structured Resume Draft JsonNode
     * for auto-filling the Resume Builder form.
     */
    public JsonNode parsePdfToDraft(MultipartFile resumeFile) throws IOException {
        String resumeText = pdfService.extractText(resumeFile);
        log.info("Extracting structured draft from {} chars of PDF text", resumeText.length());

        String systemPrompt = """
            You are an expert resume parser.
            Extract structured resume data from the provided resume text into JSON:
            {
              "personalInfo": {
                "name": "<full name or empty>",
                "email": "<email or empty>",
                "phone": "<phone or empty>",
                "location": "<location or empty>",
                "linkedin": "<linkedin or empty>",
                "portfolio": "<portfolio or empty>"
              },
              "summary": "<professional summary text>",
              "education": [
                { "institution": "", "degree": "", "field": "", "year": "", "gpa": "" }
              ],
              "experience": [
                { "company": "", "role": "", "duration": "", "bullets": [""] }
              ],
              "skills": ["..."],
              "projects": [
                { "name": "", "description": "", "tech": "", "url": "" }
              ]
            }
            Return ONLY valid JSON. Do NOT fabricate experience, metrics, or skills not present in the resume text.
            """;

        String userMessage = "Resume text:\n" + resumeText;
        return groqService.chatJson(systemPrompt, userMessage);
    }

    /**
     * Generates an improved suggestion for a summary or experience bullet.
     */
    public String improveField(String fieldType, String text) {
        if (text == null || text.isBlank()) {
            return text;
        }

        String systemPrompt;
        String userMessage;

        if ("summary".equalsIgnoreCase(fieldType)) {
            systemPrompt = """
                You are a professional resume writer. Rewrite the following resume summary to be more concise, impactful, and achievement-oriented.
                Rules:
                - Keep it to 2-3 sentences maximum
                - Use active voice, not passive
                - Remove filler words and generic claims ("hardworking," "team player") unless backed by specifics
                - If the original mentions specific technologies, projects, or metrics, preserve and emphasize them — do not invent new facts, numbers, or experience the user didn't provide
                - Return ONLY the rewritten text, no preamble, no quotation marks, no explanation
                """;
            userMessage = "Original summary: " + text;
        } else {
            systemPrompt = """
                You are a professional resume writer. Rewrite the following resume bullet point to be more impactful.
                Rules:
                - Start with a strong action verb
                - Quantify impact ONLY if a number, percentage, or scale is already present or clearly implied in the original — never fabricate metrics
                - Keep to one line, under 25 words
                - Follow the "Action + Task + Result" structure where possible
                - Return ONLY the rewritten bullet, no preamble, no bullet symbol, no quotation marks
                """;
            userMessage = "Original bullet: " + text;
        }

        String result = groqService.chatText(systemPrompt, userMessage);
        return result != null ? result.trim().replaceAll("^[\"']|[\"']$", "") : text;
    }

    // ──────────────────────────────────────────────────────────────────────────

    private List<String> toStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> {
                String text = n.asText("").trim();
                if (!text.isEmpty()) list.add(text);
            });
        }
        return list;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
