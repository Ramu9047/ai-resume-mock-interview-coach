package com.resumecoach.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Key-value pair object representing a keyword and its frequency count.
 * Used instead of Map<String, Integer> to avoid MongoDB's restriction
 * against dots/special characters in map keys.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordEntry {
    private String keyword;
    private int count;
}
