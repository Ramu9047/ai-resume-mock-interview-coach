package com.resumecoach.dto;

import lombok.*;

/** One entry in the top JD keywords bar chart. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TopKeywordDto {
    private String keyword;
    private long count;
}
