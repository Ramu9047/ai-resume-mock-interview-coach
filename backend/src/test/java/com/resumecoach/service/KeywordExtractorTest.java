package com.resumecoach.service;

import com.resumecoach.model.KeywordEntry;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class KeywordExtractorTest {

    @Test
    void testExtractFrequencyWithoutException() {
        String text = "Java Spring Boot Java Developer Java Spring Microservices Docker Kubernetes";
        List<KeywordEntry> freq = KeywordExtractor.extractFrequency(text);

        assertNotNull(freq);
        assertFalse(freq.isEmpty());

        KeywordEntry top = freq.get(0);
        assertEquals("java", top.getKeyword());
        assertEquals(3, top.getCount());
    }
}
