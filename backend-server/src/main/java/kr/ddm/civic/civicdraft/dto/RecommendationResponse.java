package kr.ddm.civic.civicdraft.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 채널 추천 응답 모델
 */
@Schema(description = "채널 추천 응답 모델. 추천 카드 리스트, 최상위 추천 채널, 근거 요약 포함.")
public class RecommendationResponse {
    @Schema(description = "추천 카드 리스트", example = "[{...}, {...}, {...}]")
    private List<ChannelOption> options;
    @Schema(description = "최상위 추천 채널 id", example = "safety_report")
    private String recommendedChannel;
    @Schema(description = "추천 근거 요약", example = "신호, 불법주정차 등 근거")
    private String rationaleSummary;

    public List<ChannelOption> getOptions() { return options; }
    public void setOptions(List<ChannelOption> options) { this.options = options; }
    public String getRecommendedChannel() { return recommendedChannel; }
    public void setRecommendedChannel(String recommendedChannel) { this.recommendedChannel = recommendedChannel; }
    public String getRationaleSummary() { return rationaleSummary; }
    public void setRationaleSummary(String rationaleSummary) { this.rationaleSummary = rationaleSummary; }
}
