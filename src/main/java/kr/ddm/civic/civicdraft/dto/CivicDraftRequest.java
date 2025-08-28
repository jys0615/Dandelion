package kr.ddm.civic.civicdraft.dto;

import java.util.List;

/**
 * 민원 초안 생성 요청 DTO
 */
public class CivicDraftRequest {
    /** 채널명 */
    private String channel;
    /** 우편번호 */
    private String address_zip;
    /** 상세주소 */
    private String address_detail;
    /** 추가주소 */
    private String address_extra;
    /** 휴대전화 */
    private String phone;
    /** 이메일 */
    private String email;
    /** 제목 */
    private String title;
    /** 민원 내용 */
    private String body;
    /** 첨부파일 메타데이터 (별도 업로드/다운로드 API에서 관리) */
    private List<AttachmentMeta> attachments;
    /** 문자알림 신청 여부 */
    private boolean sms_notify;
    /** 공개/비공개 */
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
