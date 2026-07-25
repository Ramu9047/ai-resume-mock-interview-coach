package com.resumecoach.dto;

import lombok.*;

/** One entry in the top skill-gaps bar chart. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TopGapDto {
    private String gap;
    private long count;
}
