package com.intellimeds.education;

import com.intellimeds.education.dto.EducationContentResponse;
import com.intellimeds.education.model.EducationContent;
import com.intellimeds.education.repository.EducationContentRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationContentRepository contentRepository;

    public List<EducationContentResponse> getAllContent() {
        return contentRepository.findByIsPublishedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EducationContentResponse getContentById(UUID id) {
        EducationContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EducationContent", "id", id));
        return mapToResponse(content);
    }

    public List<EducationContentResponse> getContentByCategory(String category) {
        return contentRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public String getDownloadUrl(UUID id) {
        EducationContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EducationContent", "id", id));
        content.setDownloadCount(content.getDownloadCount() + 1);
        contentRepository.save(content);
        return content.getFileUrl();
    }

    private EducationContentResponse mapToResponse(EducationContent content) {
        return EducationContentResponse.builder()
                .id(content.getId())
                .title(content.getTitle())
                .description(content.getDescription())
                .content(content.getContent())
                .contentType(content.getContentType().name())
                .fileUrl(content.getFileUrl())
                .videoUrl(content.getVideoUrl())
                .authorName(content.getAuthor() != null ? content.getAuthor().getName() : null)
                .category(content.getCategory())
                .isPublished(content.getIsPublished())
                .downloadCount(content.getDownloadCount())
                .createdAt(content.getCreatedAt())
                .build();
    }
}
