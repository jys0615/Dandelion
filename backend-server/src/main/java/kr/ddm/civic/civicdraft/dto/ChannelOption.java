package kr.ddm.civic.civicdraft.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 추천 카드형 옵션 정보
 */
@Schema(description = "추천 카드형 옵션 정보. 채널별 추천 카드에 표시되는 정보.")
public class ChannelOption {
    @Schema(description = "채널 id", example = "safety_report")
    private String id;
    @Schema(description = "채널 표시명", example = "안전신문고")
    private String title;
    @Schema(description = "원점수", example = "1.2")
    private double score;
    @Schema(description = "정규화 신뢰도", example = "0.95")
    private double confidence;
    @Schema(description = "의사결정 근거 코드", example = "[\"KW_신호\", \"PEN_불법\"]")
    private List<String> reasonCodes;
    @Schema(description = "매칭된 실제 단어/구절", example = "[\"신호\", \"불법\"]")
    private List<String> matchedTerms;
    @Schema(description = "추천 기본 문안", example = "[서울] 불법주정차로 병목 발생 신고 ...")
    private String suggestedTemplate;
    @Schema(description = "추천 여부(하이라이트)", example = "true")
    private boolean highlight;

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
