package com.resumecoach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.resumecoach.dto.*;
import com.resumecoach.model.InterviewAnswer;
import com.resumecoach.model.Question;
import com.resumecoach.model.Session;
import com.resumecoach.repository.InterviewAnswerRepository;
import com.resumecoach.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final SessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final GroqService groqService;

    // ── System prompts ──────────────────────────────────────────────────────

    private static final String QUESTIONS_SYSTEM_PROMPT = """
        You are a senior interviewer conducting a mock technical interview.
        Based on the candidate's resume and job description, generate exactly 5 interview questions:
          - 2 technical questions specific to the candidate's listed skills, tools, or projects
          - 2 behavioral questions (STAR-method friendly)
          - 1 role-fit / motivation question
        Each question should be substantive and tailored — avoid generic questions.
        Return ONLY valid JSON in this exact format — no preamble, no markdown:
        {
          "questions": [
            { "questionId": "q1", "question": "...", "category": "technical" },
            { "questionId": "q2", "question": "...", "category": "technical" },
            { "questionId": "q3", "question": "...", "category": "behavioral" },
            { "questionId": "q4", "question": "...", "category": "behavioral" },
            { "questionId": "q5", "question": "...", "category": "role-fit" }
          ]
        }
        """;

    private static final String ANSWER_EVAL_SYSTEM_PROMPT = """
        You are a seasoned interview coach evaluating a candidate's interview answer.
        Be constructive, specific, and encouraging. Reference the candidate's actual words.
        Return ONLY valid JSON in this exact format — no preamble, no markdown:
        {
          "score": <integer 0-10>,
          "feedback": "<2-3 sentences of specific, constructive feedback>"
        }
        Scoring guide: 8-10 = excellent, 5-7 = good with room to improve, 3-4 = weak, 0-2 = off-topic or incomplete.
        """;

    // ── Public methods ───────────────────────────────────────────────────────

    /**
     * Generates 5 interview questions tailored to the session's resume + JD.
     * Saves questions back onto the Session document.
     */
    public GenerateQuestionsResponse generateQuestions(String sessionId) {
        Session session = requireSession(sessionId);

        // Re-use cached questions if already generated
        if (session.getQuestions() != null && !session.getQuestions().isEmpty()) {
            log.info("Returning cached questions for sessionId={}", sessionId);
            return toQuestionsResponse(session.getQuestions());
        }

        String userMessage = """
            Resume text:
            %s

            Job description:
            %s
            """.formatted(session.getResumeText(), session.getJobDescription());

        JsonNode result = groqService.chatJson(QUESTIONS_SYSTEM_PROMPT, userMessage);

        List<Question> questions = new ArrayList<>();
        JsonNode questionsNode = result.path("questions");
        if (questionsNode.isArray()) {
            questionsNode.forEach(q -> questions.add(Question.builder()
                .questionId(q.path("questionId").asText())
                .question(q.path("question").asText())
                .category(q.path("category").asText())
                .build()));
        }

        // Persist questions onto session
        session.setQuestions(questions);
        sessionRepository.save(session);
        log.info("Generated {} questions for sessionId={}", questions.size(), sessionId);

        return toQuestionsResponse(questions);
    }

    /**
     * Evaluates a candidate's answer via Groq and persists the result.
     */
    public SubmitAnswerResponse submitAnswer(SubmitAnswerRequest req) {
        Session session = requireSession(req.getSessionId());

        // Look up the question text from the session
        Question question = session.getQuestions().stream()
            .filter(q -> q.getQuestionId().equals(req.getQuestionId()))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Question ID " + req.getQuestionId() + " not found in session."
            ));

        String userMessage = """
            Interview question: %s

            Candidate's answer: %s
            """.formatted(question.getQuestion(), req.getAnswer());

        JsonNode result = groqService.chatJson(ANSWER_EVAL_SYSTEM_PROMPT, userMessage);

        int score       = clamp(result.path("score").asInt(5), 0, 10);
        String feedback = result.path("feedback").asText("No feedback provided.");

        // Persist answer
        InterviewAnswer answer = InterviewAnswer.builder()
            .sessionId(req.getSessionId())
            .questionId(req.getQuestionId())
            .question(question.getQuestion())
            .category(question.getCategory())
            .answer(req.getAnswer())
            .score(score)
            .feedback(feedback)
            .build();
        answerRepository.save(answer);
        log.info("Saved answer for sessionId={} questionId={} score={}", req.getSessionId(), req.getQuestionId(), score);

        return SubmitAnswerResponse.builder()
            .score(score)
            .feedback(feedback)
            .build();
    }

    /**
     * Builds the final interview summary for a session.
     */
    public SummaryResponse getSummary(String sessionId) {
        requireSession(sessionId); // validate session exists
        List<InterviewAnswer> answers = answerRepository.findBySessionIdOrderByAnsweredAtAsc(sessionId);

        if (answers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No answers found for session " + sessionId + ". Complete the interview first.");
        }

        double overallScore = answers.stream()
            .mapToInt(InterviewAnswer::getScore)
            .average()
            .orElse(0.0);

        List<BreakdownItem> breakdown = answers.stream()
            .map(a -> BreakdownItem.builder()
                .question(a.getQuestion())
                .category(a.getCategory())
                .answer(a.getAnswer())
                .score(a.getScore())
                .feedback(a.getFeedback())
                .build())
            .toList();

        String recommendation = buildRecommendation(overallScore);

        return SummaryResponse.builder()
            .overallScore(Math.round(overallScore * 10.0) / 10.0)
            .breakdown(breakdown)
            .recommendation(recommendation)
            .build();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Session requireSession(String sessionId) {
        return sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Session not found: " + sessionId
            ));
    }

    private GenerateQuestionsResponse toQuestionsResponse(List<Question> questions) {
        List<QuestionDto> dtos = questions.stream()
            .map(q -> QuestionDto.builder()
                .questionId(q.getQuestionId())
                .question(q.getQuestion())
                .category(q.getCategory())
                .build())
            .toList();
        return GenerateQuestionsResponse.builder().questions(dtos).build();
    }

    private String buildRecommendation(double score) {
        if (score >= 8.0) return "Outstanding performance! You're well-prepared for this role. Focus on polishing edge cases and you'll ace the real interview.";
        if (score >= 6.0) return "Solid performance with some areas to strengthen. Review your weaker answers, practice the STAR method for behavioral questions, and deepen technical fundamentals.";
        if (score >= 4.0) return "Moderate performance. Significant preparation is needed — revisit core technical concepts, practice structured answers, and do more mock interviews before applying.";
        return "This interview revealed major gaps. Focus on foundational skills, study the job description carefully, and consider targeted courses or projects before re-attempting.";
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
