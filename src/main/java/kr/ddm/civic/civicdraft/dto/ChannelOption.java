package kr.ddm.civic.civicdraft.dto;

import java.util.List;

/**
 * 추천 카드형 옵션 정보
 */
public class ChannelOption {
    private String id; // "safety_report" | "mayor_board" | "saeol"
    private String title; // 프런트 표시명
    private double score; // 원점수
    private double confidence; // 정규화 신뢰도
    private List<String> reasonCodes; // 의사결정 근거 코드
    private List<String> matchedTerms; // 매칭된 실제 단어/구절
    private String suggestedTemplate; // 프런트 기본 문안
    private boolean highlight; // 추천 여부

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public List<String> getReasonCodes() { return reasonCodes; }
    public void setReasonCodes(List<String> reasonCodes) { this.reasonCodes = reasonCodes; }
    public List<String> getMatchedTerms() { return matchedTerms; }
    public void setMatchedTerms(List<String> matchedTerms) { this.matchedTerms = matchedTerms; }
    public String getSuggestedTemplate() { return suggestedTemplate; }
    public void setSuggestedTemplate(String suggestedTemplate) { this.suggestedTemplate = suggestedTemplate; }
    public boolean isHighlight() { return highlight; }
    public void setHighlight(boolean highlight) { this.highlight = highlight; }
}
