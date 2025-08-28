package kr.ddm.civic.civicdraft.dto;

import java.util.List;
import java.util.Map;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "민원 초안 생성 응답 DTO. GPT 기반 본문, 첨부/법률정보 안내, 품질/안전 평가 등 포함.")
public class CivicDraftResponse {
    @Schema(description = "추천된 채널명", example = "safety_report")
    private String channel;
    @Schema(description = "민원 제목", example = "이문로 교통 개선 요청")
    private String title;
    @Schema(description = "민원 본문(GPT 기반)", example = "안녕하십니까. ...")
    private String body;
    @Schema(description = "요청사항 리스트", example = "[\"신호주기 조정 요청\", \"현장 점검 요청\"]")
    private List<String> bulletedRequests;
    @Schema(description = "채널별 추가 필드(사용 안함)")
    private Map<String, Object> channelFields;
    @Schema(description = "법률 근거 리스트")
    private List<Map<String, Object>> legalBasis;
    @Schema(description = "품질 평가 점수", example = "0.95")
    private double confidence;
    @Schema(description = "누락된 필드 리스트", example = "[\"주소\", \"사실\"]")
    private List<String> missingFields;
    @Schema(description = "안전 위험 플래그")
    private Map<String, Object> safetyFlags;
    @Schema(description = "첨부파일 메타데이터 (별도 업로드/다운로드 API에서 관리)")
    private List<AttachmentMeta> attachments;
    @Schema(description = "첨부 안내 텍스트", example = "현장 사진, 증빙자료 첨부 시 처리 속도 향상")
    private String attachmentGuidance;
    @Schema(description = "법률정보 요약", example = "도로교통법 제12조 - ...")
    private String legalInfoSummary;

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public List<String> getBulletedRequests() { return bulletedRequests; }
    public void setBulletedRequests(List<String> bulletedRequests) { this.bulletedRequests = bulletedRequests; }
    public Map<String, Object> getChannelFields() { return channelFields; }
    public void setChannelFields(Map<String, Object> channelFields) { this.channelFields = channelFields; }
    public List<Map<String, Object>> getLegalBasis() { return legalBasis; }
    public void setLegalBasis(List<Map<String, Object>> legalBasis) { this.legalBasis = legalBasis; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }
    public Map<String, Object> getSafetyFlags() { return safetyFlags; }
    public void setSafetyFlags(Map<String, Object> safetyFlags) { this.safetyFlags = safetyFlags; }
    public List<AttachmentMeta> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentMeta> attachments) { this.attachments = attachments; }
    public String getAttachmentGuidance() { return attachmentGuidance; }
    public void setAttachmentGuidance(String attachmentGuidance) { this.attachmentGuidance = attachmentGuidance; }
    public String getLegalInfoSummary() { return legalInfoSummary; }
    public void setLegalInfoSummary(String legalInfoSummary) { this.legalInfoSummary = legalInfoSummary; }
}
