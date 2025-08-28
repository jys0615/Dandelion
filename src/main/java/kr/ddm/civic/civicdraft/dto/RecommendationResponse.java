package kr.ddm.civic.civicdraft.dto;

import java.util.List;

/**
 * 채널 추천 응답 모델
 */
public class RecommendationResponse {
    private List<ChannelOption> options; // 3개 카드
    private String recommendedChannel;   // 최상위 id
    private String rationaleSummary;     // 한 줄 요약

    public List<ChannelOption> getOptions() { return options; }
    public void setOptions(List<ChannelOption> options) { this.options = options; }
    public String getRecommendedChannel() { return recommendedChannel; }
    public void setRecommendedChannel(String recommendedChannel) { this.recommendedChannel = recommendedChannel; }
    public String getRationaleSummary() { return rationaleSummary; }
    public void setRationaleSummary(String rationaleSummary) { this.rationaleSummary = rationaleSummary; }
}
