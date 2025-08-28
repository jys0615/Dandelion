package kr.ddm.civic.civicdraft.service;

import kr.ddm.civic.civicdraft.dto.ComplaintRequest;
import kr.ddm.civic.civicdraft.dto.BookmarkletResponse;
import kr.ddm.civic.civicdraft.dto.ComplaintSummaryDto;
import kr.ddm.civic.civicdraft.model.ComplaintData;
import kr.ddm.civic.civicdraft.repository.ComplaintDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class BookmarkletService {

    @Value("${nodejs.server.url:http://localhost:3000}")
    private String nodejsServerUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    private ComplaintDataRepository complaintDataRepository;

    @Autowired
    private AiImprovementService aiImprovementService;

    // 지원되는 시스템 목록
    private static final List<String> SUPPORTED_SYSTEMS = Arrays.asList("SAFETY", "DDM", "SAEOL");

    public BookmarkletService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public BookmarkletResponse generateBookmarklet(ComplaintRequest request) {
        try {
            log.info("북마클릿 생성 프로세스 시작 - 시스템: {}, 제목: {}", request.getSystem(), request.getTitle());

            // 1단계: 시스템 유효성 검사
            if (request.getSystem() == null || request.getSystem().isEmpty()) {
                request.setSystem("SAFETY"); // 기본값
            } else if (!SUPPORTED_SYSTEMS.contains(request.getSystem())) {
                return createErrorResponse("지원하지 않는 민원 시스템입니다: " + request.getSystem());
            }

            // 2단계: 데이터베이스에 원본 데이터 저장
            ComplaintData complaintData = new ComplaintData();
            complaintData.setSystem(request.getSystem());
            complaintData.setTitle(request.getTitle());
            complaintData.setContent(request.getContent());
            complaintData.setPhone(request.getPhone());
            complaintData.setEmail(request.getEmail());
            complaintData.setIsPublic(request.getAdditionalProperties().get("isPublic") != null
                    ? request.getAdditionalProperties().get("isPublic").toString()
                    : "N");
            complaintData.setSmsNotification(request.getAdditionalProperties().get("smsNotification") != null
                    ? request.getAdditionalProperties().get("smsNotification").toString()
                    : "N");

            // DB 저장
            complaintData = complaintDataRepository.save(complaintData);
            log.info("원본 데이터 DB 저장 완료 - ID: {}", complaintData.getId());

            // 3단계: AI 서버에 제목과 내용 전송하여 개선된 내용 받기
            log.info("AI 내용 개선 요청 시작");
            String improvedContent = aiImprovementService.improveContent(complaintData.getTitle(),
                    complaintData.getContent());

            // 4단계: 개선된 내용으로 DB 업데이트
            complaintData.setAiImprovedContent(improvedContent);
            complaintData = complaintDataRepository.save(complaintData);
            log.info("AI 개선된 내용 DB 업데이트 완료 - ID: {}", complaintData.getId());

            // 5단계: 중요! DB에 저장된 데이터를 기반으로 북마클릿 생성
            ComplaintRequest dbBasedRequest = convertToComplaintRequest(complaintData);
            log.info("DB 저장된 데이터를 기반으로 북마클릿 생성 - ID: {}", complaintData.getId());

            return generateBookmarkletFromRequest(dbBasedRequest);

        } catch (RestClientException e) {
            log.error("Node.js 서버 통신 오류: ", e);
            return createErrorResponse("Node.js 서버 연결 실패: " + e.getMessage());
        } catch (Exception e) {
            log.error("북마클릿 생성 중 오류 발생: ", e);
            return createErrorResponse("북마클릿 생성 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * DB에 저장된 데이터를 기반으로 북마클릿 재생성
     */
    public BookmarkletResponse regenerateBookmarkletById(Long id) {
        try {
            log.info("DB 조회 기반 북마클릿 재생성 시작 - ID: {}", id);

            // 1단계: DB에서 데이터 조회
            Optional<ComplaintData> optionalData = complaintDataRepository.findById(id);
            if (!optionalData.isPresent()) {
                return createErrorResponse("ID " + id + "에 해당하는 데이터를 찾을 수 없습니다.");
            }

            ComplaintData complaintData = optionalData.get();
            log.info("DB 조회 완료 - 제목: {}, 시스템: {}", complaintData.getTitle(), complaintData.getSystem());

            // 2단계: DB 데이터를 ComplaintRequest로 변환
            ComplaintRequest request = convertToComplaintRequest(complaintData);

            // 3단계: Node.js 서버로 북마클릿 생성 요청
            return generateBookmarkletFromRequest(request);

        } catch (Exception e) {
            log.error("DB 조회 기반 북마클릿 재생성 중 오류 발생: ", e);
            return createErrorResponse("북마클릿 재생성 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 기존 DB에 저장된 민원 1건을 AI 서버에 보내 개선본을 받아와 저장합니다.
     */
    @Transactional
    public ComplaintData improveAndUpdate(Long id) {
        log.info("AI 개선 요청(단건) 시작 - ID: {}", id);

        ComplaintData data = complaintDataRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ID " + id + "에 해당하는 데이터를 찾을 수 없습니다."));

        // AI 서버 호출로 개선된 본문 획득
        String improved = aiImprovementService.improveContent(data.getTitle(), data.getContent());

        // 개선 결과가 유효하면 저장
        if (improved != null && !improved.trim().isEmpty()) {
            data.setAiImprovedContent(improved);
            data = complaintDataRepository.save(data);
            log.info("AI 개선본 저장 완료 - ID: {}, length={}",
                    data.getId(),
                    data.getAiImprovedContent() != null ? data.getAiImprovedContent().length() : 0);
        } else {
            log.warn("AI 개선 결과가 비어 있어 원문 유지 - ID: {}", data.getId());
        }

        return data;
    }

    /**
     * 저장된 민원 데이터 목록 조회 (DTO 사용)
     */
    public List<ComplaintSummaryDto> getAllComplaints() {
        List<ComplaintData> complaints = complaintDataRepository.findAll();
        return complaints.stream()
                .map(data -> new ComplaintSummaryDto(
                        data.getId(),
                        data.getSystem(),
                        data.getTitle(),
                        data.getContent(),
                        data.getPhone(),
                        data.getEmail(),
                        data.getIsPublic(),
                        data.getSmsNotification(),
                        data.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 특정 시스템의 민원 데이터 목록 조회 (DTO 사용)
     */
    public List<ComplaintSummaryDto> getComplaintsBySystem(String system) {
        List<ComplaintData> complaints = complaintDataRepository.findBySystemOrderByCreatedAtDesc(system);
        return complaints.stream()
                .map(data -> new ComplaintSummaryDto(
                        data.getId(),
                        data.getSystem(),
                        data.getTitle(),
                        data.getContent(),
                        data.getPhone(),
                        data.getEmail(),
                        data.getIsPublic(),
                        data.getSmsNotification(),
                        data.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * ComplaintData를 ComplaintRequest로 변환
     */
    private ComplaintRequest convertToComplaintRequest(ComplaintData data) {
        ComplaintRequest request = new ComplaintRequest();
        request.setSystem(data.getSystem());
        request.setTitle(data.getTitle());

        // AI 서버가 보낸 내용이 있으면 사용, 없으면 원본 사용
        String contentToUse = (data.getAiImprovedContent() != null && !data.getAiImprovedContent().trim().isEmpty())
                ? data.getAiImprovedContent()
                : data.getContent();
        request.setContent(contentToUse);

        request.setPhone(data.getPhone());
        request.setEmail(data.getEmail());

        // 추가 필드 설정
        if (data.getIsPublic() != null) {
            request.setAdditionalProperty("isPublic", data.getIsPublic());
        }
        if (data.getSmsNotification() != null) {
            request.setAdditionalProperty("smsNotification", data.getSmsNotification());
        }

        return request;
    }

    /**
     * ComplaintRequest를 Node.js 서버로 전송하여 북마클릿 생성
     */
    private BookmarkletResponse generateBookmarkletFromRequest(ComplaintRequest request) {
        Map<String, Object> requestBody = buildRequestBody(request);

        String url = nodejsServerUrl + "/api/generate-bookmarklet";
        log.info("Node.js 서버로 최종 요청 전송: {}, 시스템: {}", url, request.getSystem());
        log.debug("요청 데이터: {}", requestBody);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<BookmarkletResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                BookmarkletResponse.class);

        log.info("북마클릿 생성 완료: 시스템={}, templateId={}",
                request.getSystem(),
                response.getBody() != null ? response.getBody().getTemplateId() : "null");

        return response.getBody();
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
    public List<Map<String, String>> getAvailableSystems() {
        return Arrays.asList(
                Map.of("code", "SAFETY", "name", "안전신문고"),
                Map.of("code", "DDM", "name", "구청장에게 바란다"),
                Map.of("code", "SAEOL", "name", "새올전자민원창구"));
    }
    
}