package kr.ddm.civic.civicdraft.controller;

import kr.ddm.civic.civicdraft.dto.ComplaintRequest;
import kr.ddm.civic.civicdraft.dto.BookmarkletResponse;
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
        "https://10.110.202.54:8084"
})
public class BookmarkletController {

    private final BookmarkletService bookmarkletService;

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