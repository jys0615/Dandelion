package kr.ddm.civic.civicdraft.controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.beans.factory.annotation.Autowired;
import kr.ddm.civic.civicdraft.service.CivicDraftService;
import kr.ddm.civic.civicdraft.dto.CivicDraftRequest;
import kr.ddm.civic.civicdraft.dto.Issue;
import kr.ddm.civic.civicdraft.dto.RecommendationResponse;
import kr.ddm.civic.civicdraft.service.ChannelClassifierService;

@RestController
@RequestMapping("/api/civicdraft")
public class CivicDraftController {
    private static final Logger log = LoggerFactory.getLogger(CivicDraftController.class);

    @Autowired
    private CivicDraftService civicDraftService;

    @Autowired
    private ChannelClassifierService channelClassifierService;
    /**
     * 카드형 추천 API
     * 입력 민원 정보(Issue)를 받아 3개 채널 추천 카드와 메타데이터 반환
     */
    @Operation(
        summary = "민원 분류 카드형 추천",
        description = "입력 민원 정보(Issue)를 기반으로 3개 채널(안전신문고, 구청장에게 바란다, 새올전자민원창구)에 대한 추천 카드 리스트와 추천 채널, 근거 요약을 반환.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "추천 카드형 응답",
                content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = RecommendationResponse.class))
            )
        }
    )
    @PostMapping(value = "/recommend", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RecommendationResponse recommend(@RequestBody Issue issue) {
        try {
            // 테스트 에러 로직 제거, summary만 사용
            return channelClassifierService.recommend(issue);
        } catch (Exception e) {
            log.error("/recommend API 예외", e);
            throw e;
        }
    }

    /**
     * 초안 생성 SSE 스트림
     * 각 chunk는 draft 본문 일부이며, 마지막에 [QUALITY], [SAFETY] 정보가 전송됨
     * 프론트엔드는 chunk prefix로 구분하여 실시간 품질/안전 정보를 UI에 반영 가능
     */
    @Operation(
        summary = "실시간 초안 생성 SSE 스트림",
        description = "각 chunk는 draft 본문 일부이며, 마지막에 [QUALITY], [SAFETY] 정보가 전송됨. 프론트엔드는 chunk prefix로 구분하여 실시간 품질/안전 정보를 UI에 반영 가능.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "SSE 스트림 응답 (text/event-stream)",
                content = @Content(mediaType = "text/event-stream",
                    schema = @Schema(type = "string", example = "data: draft_chunk...\\ndata: [QUALITY]...\\ndata: [SAFETY]..."))
            )
        }
    )
    @PostMapping(value = "/draft/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDraft(@RequestBody CivicDraftRequest request) {
    // CivicDraftRequest에서 legalCandidatesJson 제거됨
    SseEmitter emitter = new SseEmitter(10 * 60 * 1000L); // 10분 타임아웃
    civicDraftService.processRequestSse(request, emitter);
    return emitter;
    }
}
