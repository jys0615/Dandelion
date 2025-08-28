package kr.ddm.civic.civicdraft.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 민원 초안 생성 요청 DTO
 */
@Schema(description = "민원 초안 생성 요청 DTO. 단계별 입력값을 누적하여 최종 민원 생성에 사용.")
public class CivicDraftRequest {
    @Schema(description = "추천된 채널명", example = "safety_report")
    private String channel;
    @Schema(description = "우편번호", example = "02400")
    private String address_zip;
    @Schema(description = "상세주소", example = "서울 동대문구 이문로 123")
    private String address_detail;
    @Schema(description = "추가주소", example = "이문동 45-1")
    private String address_extra;
    @Schema(description = "휴대전화", example = "010-1234-5678")
    private String phone;
    @Schema(description = "이메일", example = "user@example.com")
    private String email;
    @Schema(description = "민원 제목", example = "이문로 교통 개선 요청")
    private String title;
    @Schema(description = "민원 내용(요약+제목 기반 GPT 생성)", example = "안녕하십니까. ...")
    private String body;
    @Schema(description = "첨부파일 메타데이터 (별도 업로드/다운로드 API에서 관리)")
    private List<AttachmentMeta> attachments;
    @Schema(description = "문자알림 신청 여부", example = "true")
    private boolean sms_notify;
    @Schema(description = "공개/비공개", example = "public")
    private String public_visibility;

    // Getter/Setter
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getAddress_zip() { return address_zip; }
    public void setAddress_zip(String address_zip) { this.address_zip = address_zip; }
    public String getAddress_detail() { return address_detail; }
    public void setAddress_detail(String address_detail) { this.address_detail = address_detail; }
    public String getAddress_extra() { return address_extra; }
    public void setAddress_extra(String address_extra) { this.address_extra = address_extra; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public List<AttachmentMeta> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentMeta> attachments) { this.attachments = attachments; }
    public boolean isSms_notify() { return sms_notify; }
    public void setSms_notify(boolean sms_notify) { this.sms_notify = sms_notify; }
    public String getPublic_visibility() { return public_visibility; }
    public void setPublic_visibility(String public_visibility) { this.public_visibility = public_visibility; }
}
