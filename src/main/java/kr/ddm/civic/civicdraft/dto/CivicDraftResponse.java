package kr.ddm.civic.civicdraft.dto;

import java.util.List;
import java.util.Map;

public class CivicDraftResponse {
    private String channel;
    private String title;
    private String body;
    private List<String> bulletedRequests;
    private Map<String, Object> channelFields;
    private List<Map<String, Object>> legalBasis;
    private double confidence;
    private List<String> missingFields;
    private Map<String, Object> safetyFlags;
    /** 첨부파일 메타데이터 (별도 업로드/다운로드 API에서 관리) */
    private List<AttachmentMeta> attachments;
    private String attachmentGuidance;
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
