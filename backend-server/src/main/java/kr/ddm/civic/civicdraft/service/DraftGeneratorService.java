package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DraftGeneratorService {
    public Map<String, Object> generateDraft(List<String> facts, List<String> desiredActions, String location, String issueType) {
        Map<String, Object> draft = new HashMap<>();
        String title = location + " " + issueType + " 관련 민원";
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
        return draft;
    }
}
