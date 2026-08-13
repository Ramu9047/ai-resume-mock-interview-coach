package com.resumecoach.repository;

import com.resumecoach.model.InterviewAnswer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InterviewAnswerRepository extends MongoRepository<InterviewAnswer, String> {
    List<InterviewAnswer> findBySessionIdOrderByAnsweredAtAsc(String sessionId);
    boolean existsBySessionIdAndQuestionId(String sessionId, String questionId);
}
