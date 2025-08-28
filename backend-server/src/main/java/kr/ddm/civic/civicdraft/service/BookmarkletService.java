package kr.ddm.civic.civicdraft.service;

import kr.ddm.civic.civicdraft.dto.ComplaintRequest;
import kr.ddm.civic.civicdraft.dto.BookmarkletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class BookmarkletService {

    @Value("${nodejs.server.url:http://localhost:3000}")
    private String nodejsServerUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;


    
    // 지원되는 시스템 목록
    private static final List<String> SUPPORTED_SYSTEMS = Arrays.asList("SAFETY", "DDM", "SAEOL");

    public BookmarkletService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public BookmarkletResponse generateBookmarklet(ComplaintRequest request) {
        try {
            // 시스템 유효성 검사
            if (request.getSystem() == null || request.getSystem().isEmpty()) {
                request.setSystem("SAFETY"); // 기본값
            } else if (!SUPPORTED_SYSTEMS.contains(request.getSystem())) {
                return createErrorResponse("지원하지 않는 민원 시스템입니다: " + request.getSystem());
            }

            // Node.js 서버로 보낼 요청 데이터 구성
            Map<String, Object> requestBody = buildRequestBody(request);

            String url = nodejsServerUrl + "/api/generate-bookmarklet";
            log.info("Node.js 서버로 요청 전송: {}, 시스템: {}", url, request.getSystem());
            log.debug("요청 데이터: {}", requestBody);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<BookmarkletResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    BookmarkletResponse.class);

            log.info("북마클릿 생성 성공: 시스템={}, templateId={}",
                    request.getSystem(),
                    response.getBody() != null ? response.getBody().getTemplateId() : "null");

            return response.getBody();

        } catch (RestClientException e) {
            log.error("Node.js 서버 통신 오류: ", e);
            return createErrorResponse("Node.js 서버 연결 실패: " + e.getMessage());
        } catch (Exception e) {
            log.error("북마클릿 생성 중 오류 발생: ", e);
            return createErrorResponse("북마클릿 생성 중 오류 발생: " + e.getMessage());
        }
    }

    private Map<String, Object> buildRequestBody(ComplaintRequest request) {
        Map<String, Object> body = new HashMap<>();

        // 시스템 정보
        body.put("system", request.getSystem());

        // 공통 필드
        if (request.getTitle() != null)
            body.put("title", request.getTitle());
        if (request.getContent() != null)
            body.put("content", request.getContent());
        if (request.getPhone() != null)
            body.put("phone", request.getPhone());
        if (request.getEmail() != null)
            body.put("email", request.getEmail());
        if (request.getName() != null)
            body.put("name", request.getName());

        // 추가 필드들
        if (request.getAdditionalProperties() != null) {
            body.putAll(request.getAdditionalProperties());
        }

        // contents 필드 처리 (일부 시스템은 contents를 사용)
        if (body.containsKey("content") && !body.containsKey("contents")) {
            body.put("contents", body.get("content"));
        }

        return body;
    }

    private BookmarkletResponse createErrorResponse(String message) {
        BookmarkletResponse errorResponse = new BookmarkletResponse();
        errorResponse.setSuccess(false);
        errorResponse.setMessage(message);
        return errorResponse;
    }

    // 시스템 목록 조회
    // 이 메서드를 추가하세요
    public List<Map<String, String>> getAvailableSystems() {
        return Arrays.asList(
                Map.of("code", "SAFETY", "name", "안전신문고"),
                Map.of("code", "DDM", "name", "구청장에게 바란다"),
                Map.of("code", "SAEOL", "name", "새올전자민원창구"));
    }
}