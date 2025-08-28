package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 입력 파싱 서비스
 * - 민원 요약에서 위치, 이슈유형, 사실, 요청사항 등 추출
 */
@Schema(description = "입력 파싱 서비스. 민원 요약에서 위치, 이슈유형, 사실, 요청사항 등 추출.")
@Service
public class InputParserService {
    /**
     * 민원 요약에서 각종 정보 추출
     */
    public Map<String, Object> parse(String userText, boolean photos, boolean videos, String locationText) {
        Map<String, Object> result = new HashMap<>();
        // 장소 추출
        String location = (locationText != null && !locationText.isEmpty()) ? locationText : extractLocation(userText);
        result.put("location", location);
        // 이슈 유형 추출
        String issueType = extractIssueType(userText);
        result.put("issueType", issueType);
        // 사실 추출
        List<String> facts = extractFacts(userText);
        result.put("facts", facts);
        // 요청 추출
        List<String> desiredActions = extractDesiredActions(userText);
        result.put("desiredActions", desiredActions);
        // 첨부
        result.put("attachments", Map.of("photos", photos, "videos", videos));
        // 누락 필드
        List<String> missingFields = new ArrayList<>();
        if (location == null || location.isEmpty()) missingFields.add("주소");
        if (facts.isEmpty()) missingFields.add("사실");
        if (desiredActions.isEmpty()) missingFields.add("요청사항");
        if (!photos) missingFields.add("사진 유무");
        result.put("missingFields", missingFields);
        return result;
    }

    private String extractLocation(String text) {
        // 예시: "서울", "동대문구", "이문로" 등 주소 패턴 추출
        if (text.contains("이문로")) return "서울 동대문구 이문로";
        return "";
    }
    private String extractIssueType(String text) {
        if (text.contains("위험") || text.contains("안전")) return "안전";
        if (text.contains("정책") || text.contains("교통체계")) return "정책";
        return "일반";
    }
    private List<String> extractFacts(String text) {
        List<String> facts = new ArrayList<>();
        if (text.contains("막혀")) facts.add("도로가 막힘");
        if (text.contains("지연")) facts.add("버스 지연");
        if (text.contains("위험")) facts.add("비보호 좌회전 위험");
        return facts;
    }
    private List<String> extractDesiredActions(String text) {
        List<String> actions = new ArrayList<>();
        if (text.contains("신호주기")) actions.add("신호주기 조정 요청");
        if (text.contains("보행")) actions.add("보행 안전 확보 요청");
        if (text.contains("점검")) actions.add("현장 점검 요청");
        return actions;
    }
}
