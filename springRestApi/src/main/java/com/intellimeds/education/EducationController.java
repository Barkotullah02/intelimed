package com.intellimeds.education;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.education.dto.EducationContentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationContentResponse>>> getAllContent() {
        List<EducationContentResponse> content = educationService.getAllContent();
        return ResponseEntity.ok(ApiResponse.success("Education content retrieved", content));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EducationContentResponse>> getContentById(
            @PathVariable UUID id) {
        EducationContentResponse content = educationService.getContentById(id);
        return ResponseEntity.ok(ApiResponse.success("Content retrieved successfully", content));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<ApiResponse<String>> downloadContent(@PathVariable UUID id) {
        String downloadUrl = educationService.getDownloadUrl(id);
        return ResponseEntity.ok(ApiResponse.success("Download URL retrieved", downloadUrl));
    }

    @GetMapping("/share/{id}")
    public ResponseEntity<ApiResponse<String>> shareContent(@PathVariable UUID id) {
        EducationContentResponse content = educationService.getContentById(id);
        String shareUrl = "/api/education/" + id;
        return ResponseEntity.ok(ApiResponse.success("Share URL generated", shareUrl));
    }
}
