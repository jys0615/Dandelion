package kr.ddm.civic.civicdraft.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;
import kr.ddm.civic.civicdraft.dto.*;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 채널 추천 서비스
 * classifier.yml 기반으로 민원 요약에서 채널별 점수/추천/근거 생성
 */
@Schema(description = "채널 추천 서비스. classifier.yml 기반으로 민원 요약에서 채널별 점수/추천/근거 생성.")
@Service
public class ChannelClassifierService {
    private static final Logger log = LoggerFactory.getLogger(ChannelClassifierService.class);

    // classifier.yml 설정 파일 주입
    @Value("classpath:classifier.yml")
    private Resource classifierConfig;

    @SuppressWarnings("unchecked")
    public RecommendationResponse recommend(Issue issue) {
        try {
            // 1. classifier.yml 로드 및 channels 파싱
            Yaml yaml = new Yaml();
            Map<String, Object> config;
            try (java.io.InputStreamReader reader = new java.io.InputStreamReader(classifierConfig.getInputStream(), java.nio.charset.StandardCharsets.UTF_8)) {
                config = yaml.load(reader);
            }
            if (config == null) throw new RuntimeException("classifier.yml 파싱 실패");
            Object channelsObj = config.get("channels");
            if (!(channelsObj instanceof List<?>)) throw new RuntimeException("channels 필드 타입 오류");
            List<Map<String, Object>> channels = ((List<?>) channelsObj).stream()
                .filter(o -> o instanceof Map)
                .map(o -> (Map<String, Object>) o)
                .collect(Collectors.toList());
            if (channels.isEmpty()) throw new RuntimeException("channels가 비어있음");

            // 2. 각 채널별 점수 계산 및 옵션 생성
            List<ChannelOption> options = new ArrayList<>();
            double minScore = Double.MAX_VALUE, maxScore = Double.MIN_VALUE;
            for (Map<String, Object> ch : channels) {
                String id = (String) ch.getOrDefault("id", "");
                String title = (String) ch.getOrDefault("title", "");
                List<Map<String, Object>> keywords = getTermList(ch.get("keywords"));
                List<Map<String, Object>> penalties = getTermList(ch.get("penalties"));
                double score = 0.05; // 최소 바닥값
                List<String> reasonCodes = new ArrayList<>();
                List<String> matchedTerms = new ArrayList<>();

                // summary 기반 키워드/감점 가중치 적용
                String summary = (issue != null) ? issue.getSummary() : null;
                if (summary != null) {
                    score += keywords.stream()
                        .filter(kw -> kw.get("term") instanceof String && summary.contains((String) kw.get("term")))
                        .mapToDouble(kw -> {
                            reasonCodes.add("KW_" + ((String) kw.get("term")).toUpperCase());
                            matchedTerms.add((String) kw.get("term"));
                            return (kw.get("weight") instanceof Number) ? ((Number) kw.get("weight")).doubleValue() : 0.0;
                        }).sum();
                    score += penalties.stream()
                        .filter(pen -> pen.get("term") instanceof String && summary.contains((String) pen.get("term")))
                        .mapToDouble(pen -> {
                            reasonCodes.add("PEN_" + ((String) pen.get("term")).toUpperCase());
                            matchedTerms.add((String) pen.get("term"));
                            return (pen.get("weight") instanceof Number) ? ((Number) pen.get("weight")).doubleValue() : 0.0;
                        }).sum();
                }
                minScore = Math.min(minScore, score);
                maxScore = Math.max(maxScore, score);

                ChannelOption option = new ChannelOption();
                option.setId(id);
                option.setTitle(title);
                option.setScore(score);
                option.setReasonCodes(reasonCodes);
                option.setMatchedTerms(matchedTerms);
                option.setSuggestedTemplate(generateTemplate(id, issue));
                options.add(option);
            }
            if (options.isEmpty()) throw new RuntimeException("추천 options가 비어있음");

            // 3. confidence 정규화
            for (ChannelOption opt : options) {
                double conf = (maxScore == minScore) ? 1.0 : (opt.getScore() - minScore) / (maxScore - minScore);
                opt.setConfidence(Math.max(0.05, Math.min(1.0, conf)));
            }

            // 4. 추천 채널 결정 (최고 점수, 동점 시 우선순위)
            ChannelOption best = options.stream().max(Comparator.comparing(ChannelOption::getScore)).orElse(options.get(0));
            List<ChannelOption> top = options.stream().filter(o -> o.getScore() == best.getScore()).collect(Collectors.toList());
            ChannelOption bestFinal = (top.size() > 1) ?
                top.stream().min(Comparator.comparing(o -> getPriority(channels, o.getId()))).orElse(best) : best;
            options.forEach(opt -> opt.setHighlight(opt.getId().equals(bestFinal.getId())));

            // 5. rationaleSummary 생성 및 응답
            String rationaleSummary = (bestFinal.getReasonCodes().isEmpty()) ? "근거 약함" : reasonCodesToSummary(bestFinal.getReasonCodes(), bestFinal.getMatchedTerms());
            RecommendationResponse resp = new RecommendationResponse();
            resp.setOptions(options);
            resp.setRecommendedChannel(bestFinal.getId());
            resp.setRationaleSummary(rationaleSummary);
            return resp;
        } catch (Exception e) {
            log.error("카드형 추천 recommend() 예외", e);
            throw new RuntimeException("카드형 추천 로직 예외", e);
        }
    }

    /**
     * 채널별 suggestedTemplate 생성 규칙
     * @param id 채널 id
     * @param issue 민원 요약 정보
     * @return 추천 템플릿 문자열
     */
    private String generateTemplate(String id, Issue issue) {
        String location = "";
        if (issue != null && issue.getSummary() != null) {
            String[] parts = issue.getSummary().split(" ");
            if (parts.length > 0) location = parts[0];
        }
        switch (id) {
            case "safety_report":
                return String.format("[%s] 불법주정차로 병목 발생 신고\n날짜/시간대 · 위치: %s · 위반유형 · 정체 영향 · 사진(1분 간격 2장)", location, location);
            case "mayor_board":
                return String.format("[%s] 신호주기 연장 및 좌회전 분리 신설 건의\n대기행렬 · 신호 연동 · 좌회전 분리 · 노면표지 개선 요청", location);
            default:
                return String.format("[정보공개청구] %s 임시개통·교통관리 계획\n사업명 · 임시개통 검토 · 단계별 시나리오 · 협의 문서 열람 · 처리기한/담당부서", location);
        }
    }

    /**
     * reasonCodes를 자연어 요약
     * @param codes 근거 코드 리스트
     * @param terms 매칭된 키워드 리스트
     * @return 요약 문자열
     */
    private String reasonCodesToSummary(List<String> codes, List<String> terms) {
        if (codes == null || codes.isEmpty() || terms == null || terms.isEmpty()) return "근거 약함";
        StringBuilder sb = new StringBuilder();
        int limit = Math.min(2, Math.min(codes.size(), terms.size()));
        for (int i = 0; i < limit; i++) {
            if (terms.get(i) == null) continue;
            sb.append(terms.get(i)).append(" 신호");
            if (i < limit - 1) sb.append(", ");
        }
        return sb.length() == 0 ? "근거 약함" : sb.toString();
    }

    /**
     * 키워드/감점 리스트 안전 파싱
     */
    private List<Map<String, Object>> getTermList(Object obj) {
        if (!(obj instanceof List<?>)) return Collections.emptyList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object o : (List<?>) obj) {
            if (o instanceof Map<?,?>) {
                Map<?,?> raw = (Map<?,?>) o;
                Map<String, Object> safe = new HashMap<>();
                for (Map.Entry<?,?> entry : raw.entrySet()) {
                    if (entry.getKey() instanceof String) {
                        safe.put((String) entry.getKey(), entry.getValue());
                    }
                }
                result.add(safe);
            }
        }
        return result;
    }

    /**
     * 채널 우선순위 반환
     */
    private int getPriority(List<Map<String, Object>> channels, String id) {
        for (Map<String, Object> ch : channels) {
            if (id.equals(ch.get("id"))) {
                Object prio = ch.get("priority");
                return (prio instanceof Integer) ? (Integer) prio : Integer.MAX_VALUE;
            }
        }
        return Integer.MAX_VALUE;
    }
}
