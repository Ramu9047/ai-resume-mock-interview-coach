package com.resumecoach.repository;

import com.resumecoach.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {
    Optional<Session> findBySessionId(String sessionId);
    boolean existsBySessionId(String sessionId);
}
