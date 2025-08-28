package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class LegalBasisService {
    /**
     * 법률 근거 리스트 생성
     * @param candidates 법률 후보 리스트
     * @return 중복 제거, 최신순 정렬된 법률 근거 리스트(최대 3개)
     */
    public List<Map<String, Object>> buildLegalBasis(List<Map<String, Object>> candidates) {
        List<Map<String, Object>> result = new ArrayList<>();
        // 최신순 정렬
        candidates.sort((a, b) -> {
            String dateA = (String) a.get("effective_date");
            String dateB = (String) b.get("effective_date");
            return dateB.compareTo(dateA);
        });
        // 중복 제거 및 결과 생성
        Set<String> seen = new HashSet<>();
        for (Map<String, Object> candidate : candidates) {
            String key = candidate.get("law_name") + "_" + candidate.get("article");
            if (seen.contains(key)) continue;
            seen.add(key);
            Map<String, Object> basis = new HashMap<>();
            basis.put("law_level", candidate.get("law_level"));
            basis.put("law_name", candidate.get("law_name"));
            basis.put("article", candidate.get("article"));
            basis.put("effective_date", candidate.get("effective_date"));
            basis.put("quote", candidate.get("text"));
            basis.put("summary", "해당 법령은 민원 이슈와 직접적으로 관련되어 있습니다.");
            basis.put("relevance_reason", "민원과의 관련성");
            basis.put("source_url", candidate.get("source_url"));
            basis.put("confidence", 1.0);
            result.add(basis);
            if (result.size() >= 3) break;
        }
        return result;
    }

    /**
     * 법률정보 요약 생성 (제목+요약 기반)
     * @param legalBasis 법률 근거 리스트
     * @return 요약 문자열
     */
    public String buildLegalInfoSummary(List<Map<String, Object>> legalBasis) {
        if (legalBasis == null || legalBasis.isEmpty()) return "관련 법률정보 없음";
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> basis : legalBasis) {
            sb.append(basis.get("law_name"))
              .append(" 제")
              .append(basis.get("article"))
              .append(" - ")
              .append(basis.get("summary"))
              .append("\n");
        }
        return sb.toString().trim();
    }
}
