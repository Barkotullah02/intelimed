package com.intellimeds.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Thin client for Google Gemini's generateContent REST API.
 * The API key is injected from configuration (which reads GEMINI_API_KEY out of .env).
 * If no key is configured, {@link #isConfigured()} returns false and callers fall back
 * to the offline stub — so the app runs fine with no key during development.
 */
@Slf4j
@Component
public class GeminiClient {

    /**
     * Shared medical-safety system prompt for every AI answer (web /ai/explain and app /chat).
     * The guiding rule: give accurate, evidence-based medication information, or — when unsure or
     * when the question needs personal clinical judgement — tell the patient to consult a doctor.
     */
    public static final String MEDICAL_SYSTEM_PROMPT =
            "You are IntelliMeds, a careful medical-information assistant for patients. Provide "
          + "accurate, evidence-based information about medications, drug interactions, side effects, "
          + "and general medication safety, in clear plain language (a few short paragraphs).\n"
          + "You MUST follow these rules:\n"
          + "1. Only state what is medically accurate and well-established. If you are not confident, "
          + "or the question needs personal clinical judgement (specific dosing, a diagnosis, starting "
          + "or stopping a medicine, pregnancy, children, or someone's individual history), do NOT "
          + "guess — clearly tell the patient to consult their doctor or pharmacist.\n"
          + "2. Never diagnose and never prescribe. Never invent drug names, doses, or interactions.\n"
          + "3. For anything urgent or severe (chest pain, trouble breathing, severe bleeding, "
          + "overdose, fainting, suicidal thoughts), tell them to seek emergency care immediately.\n"
          + "4. Stay on medication and health-information topics; politely decline unrelated requests.\n"
          + "5. Always end by reminding them this is general information and to confirm with a qualified "
          + "healthcare professional.";

    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiClient(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models}") String apiUrl,
            @Value("${gemini.model:gemini-3.6-flash}") String model) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        // Bounded timeouts so a slow/unreachable Gemini fails fast into the offline fallback
        // instead of hanging the request (and the caller's thread) indefinitely.
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(Duration.ofSeconds(10));
        rf.setReadTimeout(Duration.ofSeconds(45));
        this.http = RestClient.builder().requestFactory(rf).build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && !apiKey.equals("REPLACE_WITH_YOUR_GEMINI_API_KEY");
    }

    /**
     * Sends a single prompt and returns Gemini's plain-text answer.
     * Throws {@link GeminiException} on any transport/parse failure so the caller can
     * decide how to degrade (we fall back to the offline explanation).
     */
    public String complete(String systemPreamble, String userContent) {
        String prompt = (systemPreamble == null ? "" : systemPreamble + "\n\n") + userContent;

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 500
                )
        );

        try {
            String url = apiUrl + "/" + model + ":generateContent?key=" + apiKey;
            String raw = http.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = mapper.readTree(raw);
            JsonNode text = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (text.isMissingNode() || text.asText().isBlank()) {
                throw new GeminiException("Gemini returned no text: " + raw);
            }
            return text.asText().trim();
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Gemini request failed: {}", e.getMessage());
            throw new GeminiException("Gemini request failed: " + e.getMessage(), e);
        }
    }

    public static class GeminiException extends RuntimeException {
        public GeminiException(String message) { super(message); }
        public GeminiException(String message, Throwable cause) { super(message, cause); }
    }
}
