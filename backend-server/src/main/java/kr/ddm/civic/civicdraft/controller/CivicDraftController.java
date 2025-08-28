package kr.ddm.civic.civicdraft.controller;
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

@RestController
@RequestMapping("/api/civicdraft")
public class CivicDraftController {

    @Autowired
    private CivicDraftService civicDraftService;

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
    SseEmitter emitter = new SseEmitter(10 * 60 * 1000L); // 10분 타임아웃
        civicDraftService.processRequestSse(request, emitter);
        return emitter;
    }
}
