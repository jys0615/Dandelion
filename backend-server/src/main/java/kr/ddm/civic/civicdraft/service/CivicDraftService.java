package kr.ddm.civic.civicdraft.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import kr.ddm.civic.civicdraft.dto.CivicDraftRequest;
import kr.ddm.civic.civicdraft.dto.CivicDraftResponse;
import kr.ddm.civic.civicdraft.model.CivicDraft;
import kr.ddm.civic.civicdraft.repository.CivicDraftRepository;
import java.util.*;
import okhttp3.*;
import java.io.*;

/**
 * 민원 초안 생성 서비스
 * - 단계별 입력값 누적
 * - 채널 추천, GPT 초안 생성, 품질/안전 평가, DB 저장, 첨부/법률정보 안내
 */
@Service
public class CivicDraftService {
    /**
     * Python SSE 엔드포인트에 OkHttp로 요청, 응답을 실시간으로 SseEmitter로 전송
     */
    public void processRequestSse(CivicDraftRequest request, SseEmitter emitter) {
        OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(10, java.util.concurrent.TimeUnit.MINUTES)
            .readTimeout(10, java.util.concurrent.TimeUnit.MINUTES)
            .writeTimeout(10, java.util.concurrent.TimeUnit.MINUTES)
            .build();
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        String url = "http://localhost:8000/process/stream";
        // 요청 JSON 생성
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{")
            .append("\"body\":\"").append(escapeJson(request.getBody())).append("\"");
        jsonBuilder.append("}");
        RequestBody body = RequestBody.create(jsonBuilder.toString(), JSON);
        Request httpRequest = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Accept", "text/event-stream")
                .build();

        // SSE 응답 비동기 처리 및 chunk 누적/후처리
        client.newCall(httpRequest).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                emitter.completeWithError(e);
            }
            @Override
            public void onResponse(Call call, Response response) {
                StringBuilder draftBodyBuilder = new StringBuilder(); // chunk 누적용
                try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.body().byteStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        // SSE 데이터 chunk 추출 및 누적
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6);
                            if ("[END]".equals(data)) break;
                            draftBodyBuilder.append(data);
                            emitter.send(data); // 클라이언트로 전송
                        }
                    }
                    // 최종 draft 본문
                    String draftBody = draftBodyBuilder.toString();

                    // 품질/안전 평가 및 DB 저장
                    double confidence = qualityAssessorService.assessConfidence(true, true, true); // 실제 구현 시 draftBody 활용
                    Map<String, Object> safetyFlags = qualityAssessorService.assessSafety(draftBody);
                    CivicDraft entity = new CivicDraft();
                    entity.setBody(draftBody); // 초안 본문 저장
                    entity.setPublicVisibility(request.getPublic_visibility());
                    civicDraftRepository.save(entity);

                    // 품질/안전 평가 결과를 클라이언트에 전송(선택)
                    emitter.send("[QUALITY]" + confidence);
                    emitter.send("[SAFETY]" + safetyFlags);

                    emitter.complete();
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            }
        });
    }

    /**
     * JSON 문자열 내 특수문자 이스케이프
     */
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    /**
     * Object를 List<String>으로 안전하게 변환하는 유틸리티
     */
    private List<String> toStringList(Object obj) {
        List<String> result = new ArrayList<>();
        if (obj instanceof List<?>) {
            for (Object item : (List<?>) obj) {
                if (item instanceof String str) {
                    result.add(str);
                }
            }
        }
        return result;
    }

    @Autowired
    private CivicDraftRepository civicDraftRepository;
    @Autowired
    private InputParserService inputParserService;
    @Autowired
    private ChannelClassifierService channelClassifierService;
    @Autowired
    private DraftGeneratorService draftGeneratorService;
    @Autowired
    private LegalBasisService legalBasisService;
    @Autowired
    private QualityAssessorService qualityAssessorService;

    /**
     * 단계별 입력값을 누적하여 최종 민원 초안 및 품질/안전/법률정보 응답 생성
     */
    public CivicDraftResponse processRequest(CivicDraftRequest request) {
        // 1. 입력 파싱
        Map<String, Object> parsed = inputParserService.parse(request.getBody(), false, false, "");

        // 2. 카드형 추천 로직 적용
        kr.ddm.civic.civicdraft.dto.Issue issue = new kr.ddm.civic.civicdraft.dto.Issue();
        issue.setSummary(request.getBody());
        String channel = channelClassifierService.recommend(issue).getRecommendedChannel();

        // 3. 초안 생성
        List<String> facts = toStringList(parsed.get("facts"));
        List<String> desiredActions = toStringList(parsed.get("desiredActions"));
        Map<String, Object> draft = draftGeneratorService.generateDraft(facts, desiredActions, (String) parsed.get("location"), (String) parsed.get("issueType"));

        // 4. 법령 근거 첨부 (legalCandidatesJson 제거, 빈 리스트 전달)
        List<Map<String, Object>> legalBasis = legalBasisService.buildLegalBasis(new ArrayList<>());

        // 5. 품질/안전 평가
        double confidence = qualityAssessorService.assessConfidence(true, true, true);
        Map<String, Object> safetyFlags = qualityAssessorService.assessSafety((String) draft.get("body"));

        // 6. DB 저장 (공개일 때만)
        if ("public".equalsIgnoreCase(request.getPublic_visibility())) {
            CivicDraft entity = new CivicDraft();
            entity.setBody((String) draft.get("body"));
            entity.setPublicVisibility(request.getPublic_visibility());
            civicDraftRepository.save(entity);
        }

        // 7. 응답 생성
        CivicDraftResponse response = new CivicDraftResponse();
        response.setChannel(channel);
        response.setTitle((String) draft.get("title"));
        response.setBody((String) draft.get("body"));
        response.setBulletedRequests(toStringList(draft.get("bulletedRequests")));
        response.setLegalBasis(legalBasis);
        response.setConfidence(confidence);
        response.setMissingFields(toStringList(parsed.get("missingFields")));
        response.setSafetyFlags(safetyFlags);
        response.setAttachmentGuidance((String) draft.get("attachmentGuidance"));
        response.setLegalInfoSummary(legalBasisService.buildLegalInfoSummary(legalBasis));
        // 첨부파일 메타데이터는 별도 API에서 관리
        response.setAttachments(request.getAttachments());
        return response;
    }
}
