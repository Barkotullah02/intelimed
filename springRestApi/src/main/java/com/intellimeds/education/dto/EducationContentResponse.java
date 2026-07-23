package com.intellimeds.education.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationContentResponse {
    private UUID id;
    private String title;
    private String description;
    private String content;
    private String contentType;
    private String fileUrl;
    private String videoUrl;
    private String authorName;
    private String category;
    private Boolean isPublished;
    private Integer downloadCount;
    private LocalDateTime createdAt;
}
