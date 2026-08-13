package com.resumecoach.repository;

import com.resumecoach.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface SessionRepository extends MongoRepository<Session, String> {
    Optional<Session> findBySessionId(String sessionId);
    boolean existsBySessionId(String sessionId);
}
