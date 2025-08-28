package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 민원 초안 본문 및 첨부 안내 생성 서비스
 */
@Schema(description = "민원 초안 본문 및 첨부 안내 생성 서비스. GPT 기반 본문, 첨부 안내 텍스트 생성.")
@Service
public class DraftGeneratorService {
    /**
     * 민원 초안 본문 및 첨부 안내 생성
     * @param facts 사실 리스트
     * @param desiredActions 요청사항 리스트
     * @param location 민원 발생 위치
     * @param issueType 민원 유형
     * @return 초안 정보(title, body, bulletedRequests, attachmentGuidance)
     */
    public Map<String, Object> generateDraft(List<String> facts, List<String> desiredActions, String location, String issueType) {
        Map<String, Object> draft = new HashMap<>();
        // 제목 생성
        String title = location + " " + issueType + " 관련 민원";
        // 본문 생성
        StringBuilder body = new StringBuilder();
        body.append("안녕하십니까. ").append(location).append(" 주민입니다. ");
        if (!facts.isEmpty()) {
            body.append("최근 다음과 같은 문제가 발생하고 있습니다: ");
            body.append(String.join(", ", facts)).append(". ");
        }
        body.append("이에 따라 다음과 같은 조치를 요청드립니다. ");
        for (String action : desiredActions) {
            body.append("- ").append(action).append("\n");
        }
        draft.put("title", title);
        draft.put("body", body.toString());
        draft.put("bulletedRequests", desiredActions);

        // 첨부 안내: 프론트에 안내할 텍스트
        String attachmentGuidance = "현장 사진(문제 상황, 위치 식별 가능), 관련 영상(필요시), 증빙자료 첨부 시 처리 속도 향상";
        draft.put("attachmentGuidance", attachmentGuidance);

        return draft;
    }
}
