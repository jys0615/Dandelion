package kr.ddm.civic.civicdraft.controller;

import kr.ddm.civic.civicdraft.dto.ComplaintRequest;
import kr.ddm.civic.civicdraft.dto.BookmarkletResponse;
import kr.ddm.civic.civicdraft.dto.ComplaintSummaryDto;
import kr.ddm.civic.civicdraft.model.ComplaintData;
import kr.ddm.civic.civicdraft.service.BookmarkletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/bookmarklet")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
        "http://localhost:8084",
        "http://localhost:8085",
        "http://192.168.202.43:8085", // 새 IP
        "http://192.168.202.43:8084",
        "https://10.110.202.54:8085",
        "https://10.110.202.54:8084",
        "http://localhost:3001",
        "http://10.110.202.54:3001"
})
public class BookmarkletController {

    private final BookmarkletService bookmarkletService;

    /**
     * 원샷 엔드포인트: 프론트에서 한 번 호출로 DB 저장 → AI 개선 → 북마클릿 생성까지 처리
     * 프론트는 이 엔드포인트만 호출하면 bookmarkletCode/bookmarkletUrl을 응답으로 받는다.
     */
    @PostMapping(path = {"", "/"}, consumes = "application/json", produces = "application/json")
    public ResponseEntity<BookmarkletResponse> createBookmarklet(@RequestBody ComplaintRequest request) {
        log.info("원샷 북마클릿 생성 요청 수신 - 시스템: {}", request.getSystem());

        // 기본 시스템 보정
        if (request.getSystem() == null || request.getSystem().isEmpty()) {
            request.setSystem("SAFETY");
        }

        BookmarkletResponse response = bookmarkletService.generateBookmarklet(request);
        if (response != null && response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<BookmarkletResponse> generateBookmarklet(@RequestBody ComplaintRequest request) {
        log.info("북마클릿 생성 요청 수신 - 시스템: {}", request.getSystem());

        // 시스템이 지정되지 않은 경우 기본값 설정
        if (request.getSystem() == null || request.getSystem().isEmpty()) {
            request.setSystem("SAFETY");
        }

        BookmarkletResponse response = bookmarkletService.generateBookmarklet(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/generate/{system}")
    public ResponseEntity<BookmarkletResponse> generateBookmarkletBySystem(
            @PathVariable String system,
            @RequestBody ComplaintRequest request) {
        log.info("시스템별 북마클릿 생성 요청 - 시스템: {}", system);

        request.setSystem(system.toUpperCase());
        return generateBookmarklet(request);
    }

    /**
     * DB에 저장된 데이터로 북마클릿 재생성
     */
    @PostMapping("/regenerate/{id}")
    public ResponseEntity<BookmarkletResponse> regenerateBookmarklet(@PathVariable Long id) {
        log.info("DB 조회 기반 북마클릿 재생성 요청 - ID: {}", id);

        BookmarkletResponse response = bookmarkletService.regenerateBookmarkletById(id);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * DB에 저장된 데이터를 AI 서버에 보내 개선본으로 업데이트(단건)
     */
    @PostMapping("/improve/{id}")
    public ResponseEntity<Map<String, Object>> improveComplaint(@PathVariable Long id) {
        log.info("AI 개선(단건) 요청 - ID: {}", id);
        ComplaintData updated = bookmarkletService.improveAndUpdate(id);
        int lenAi = (updated.getAiImprovedContent() == null) ? 0 : updated.getAiImprovedContent().length();
        String updatedAtStr = (updated.getUpdatedAt() == null) ? null : updated.getUpdatedAt().toString();
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "len_ai", lenAi,
                "updated_at", updatedAtStr));
    }

    /**
     * 저장된 민원 데이터 목록 조회
     */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintSummaryDto>> getAllComplaints() {
        log.info("저장된 민원 데이터 목록 조회");
        List<ComplaintSummaryDto> complaints = bookmarkletService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    /**
     * 특정 시스템의 민원 데이터 목록 조회
     */
    @GetMapping("/complaints/{system}")
    public ResponseEntity<List<ComplaintSummaryDto>> getComplaintsBySystem(@PathVariable String system) {
        log.info("시스템별 민원 데이터 조회 - 시스템: {}", system);
        List<ComplaintSummaryDto> complaints = bookmarkletService.getComplaintsBySystem(system.toUpperCase());
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/systems")
    public ResponseEntity<List<Map<String, String>>> getAvailableSystems() {
        log.info("민원 시스템 목록 조회");
        List<Map<String, String>> systems = bookmarkletService.getAvailableSystems();
        return ResponseEntity.ok(systems);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Spring Boot 서버가 정상 작동중입니다.",
                "supportedSystems", "SAFETY, DDM, SAEOL"));
    }
}