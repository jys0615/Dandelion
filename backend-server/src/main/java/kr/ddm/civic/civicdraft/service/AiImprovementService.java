package kr.ddm.civic.civicdraft.service;

import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AiImprovementService {

    @Value("${ai.server.url:http://3.34.192.29:8000}")
    private String aiServerUrl;

    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient;

    public AiImprovementService() {
        this.objectMapper = new ObjectMapper();
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    /**
     * AI 서버에 제목과 내용을 전송하여 개선된 내용을 받아옵니다.
     *
     * @param title   민원 제목
     * @param content 원본 민원 내용
     * @return 개선된 민원 내용(실패 시 원본 반환)
     */
    public String improveContent(String title, String content) {
        try {
            // AI 서버 스펙에 맞는 요청 데이터 구성: /process expects { "summary", "title" }
            Map<String, String> requestData = new HashMap<>();
            requestData.put("title", title != null ? title : "");
            requestData.put("summary", content != null ? content : "");

            String jsonRequest = objectMapper.writeValueAsString(requestData);
            final String url = aiServerUrl + "/process/stream";

            log.info("AI 서버로 요청 전송: {}", url);
            log.debug("요청 데이터(JSON): {}", jsonRequest);

            // HTTP 요청 생성
            RequestBody requestBody = RequestBody.create(
                    jsonRequest.getBytes(StandardCharsets.UTF_8),
                    MediaType.parse("application/json; charset=utf-8"));

            Request request = new Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .build();

            // AI 서버 호출
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("AI 서버 응답 오류: HTTP {}", response.code());
                    return content; // 원본 내용 반환
                }

                String responseBody = response.body() != null ? response.body().string() : "";
                log.debug("AI 서버 응답(JSON): {}", responseBody);

                // JSON 응답 파싱
                JsonNode jsonResponse = objectMapper.readTree(responseBody);

                // /process 응답 스키마: { "channel": "...", "title": "...", "body": "개선된 본문" }
                if (jsonResponse.has("body")) {
                    String improvedContent = jsonResponse.get("body").asText("");
                    if (improvedContent != null && !improvedContent.isBlank()) {
                        log.info("AI 내용 개선 완료: {} -> {} 글자",
                                (content != null ? content.length() : 0),
                                improvedContent.length());
                        return improvedContent;
                    } else {
                        log.warn("AI 서버 응답의 body 필드가 비어있음 -> 원본 반환");
                        return content;
                    }
                } else {
                    log.warn("AI 서버 응답에 body 필드가 없음 -> 원본 반환");
                    return content; // 원본 내용 반환
                }
            }

        } catch (Exception e) {
            log.error("AI 서버 호출 중 오류 발생", e);
            return content; // 오류 발생 시 원본 내용 반환
        }
    }

    /**
     * JSON 문자열 내 특수문자 이스케이프 (현재 미사용)
     */
    @SuppressWarnings("unused")
    private String escapeJson(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}