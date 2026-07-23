package com.intellimeds.drug;

import com.intellimeds.drug.dto.ShareRequest;
import com.intellimeds.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/drugs")
@RequiredArgsConstructor
public class DownloadShareController {

    private final DownloadShareService downloadShareService;

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> downloadDrug(@PathVariable UUID id) {
        String downloadUrl = downloadShareService.getDownloadUrl(id);
        return ResponseEntity.ok(ApiResponse.success("Download URL generated", downloadUrl));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<String>> shareDrug(
            @PathVariable UUID id,
            @RequestBody ShareRequest request) {
        String result = downloadShareService.shareDrug(id, request);
        return ResponseEntity.ok(ApiResponse.success("Drug shared successfully", result));
    }
}
