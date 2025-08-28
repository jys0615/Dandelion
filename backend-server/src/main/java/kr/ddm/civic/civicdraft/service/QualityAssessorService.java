package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class QualityAssessorService {
    public double assessConfidence(boolean channelValid, boolean contentConsistent, boolean legalMatch) {
        double score = 0.5;
        if (channelValid) score += 0.2;
        if (contentConsistent) score += 0.2;
        if (legalMatch) score += 0.1;
        return Math.min(score, 1.0);
    }
    public Map<String, Object> assessSafety(String body) {
        Map<String, Object> flags = new HashMap<>();
        boolean containsPii = body.matches(".*(\\d{6}-\\d{7}|\\d{2,3}-\\d{3,4}-\\d{4}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}).*");
        boolean defamation = body.contains("비방") || body.contains("불법") || body.contains("단정") || body.contains("업체");
        flags.put("contains_pii", containsPii);
        flags.put("defamation_risk", defamation ? "medium" : "low");
        return flags;
    }
}
