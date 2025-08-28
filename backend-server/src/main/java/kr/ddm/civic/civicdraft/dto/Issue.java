package kr.ddm.civic.civicdraft.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 민원 분류 추천용 입력 모델 (최초 요약 입력)
 */
@Schema(description = "민원 분류 추천용 입력 모델. 첫 페이지에서 간단 요약 입력받음.")
public class Issue {
    @Schema(description = "민원 요약", example = "이문로 교통체계 개선 필요")
    private String summary;

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
