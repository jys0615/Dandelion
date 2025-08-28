package kr.ddm.civic.civicdraft.dto;

/**
 * 민원 분류 추천용 입력 모델
 */
public class Issue {
    /** 민원 요약 */
    private String summary;

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
