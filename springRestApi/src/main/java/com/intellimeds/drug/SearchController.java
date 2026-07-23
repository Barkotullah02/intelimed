package com.intellimeds.drug;

import com.intellimeds.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final DrugService drugService;

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSearchSuggestions(
            @RequestParam String keyword) {
        List<String> suggestions = drugService.getDrugSuggestions(keyword);
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved", suggestions));
    }
}
