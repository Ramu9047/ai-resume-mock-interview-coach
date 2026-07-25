package com.resumecoach.repository;

import com.resumecoach.model.ResumeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeDocumentRepository extends MongoRepository<ResumeDocument, String> {
    Optional<ResumeDocument> findByResumeId(String resumeId);
    boolean existsByResumeId(String resumeId);
    void deleteByResumeId(String resumeId);
}
