package com.resumecoach.repository;

import com.resumecoach.model.InterviewAnswer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewAnswerRepository extends MongoRepository<InterviewAnswer, String> {
    List<InterviewAnswer> findBySessionIdOrderByAnsweredAtAsc(String sessionId);
    boolean existsBySessionIdAndQuestionId(String sessionId, String questionId);
}
