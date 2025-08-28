package kr.ddm.civic.civicdraft.dto;

import java.time.LocalDateTime;

public class ComplaintSummaryDto {
    private Long id;
    private String system;
    private String title;
    private String content;
    private String phone;
    private String email;
    private String isPublic;
    private String smsNotification;
    private LocalDateTime createdAt;

    public ComplaintSummaryDto(Long id, String system, String title, String content,
            String phone, String email, String isPublic,
            String smsNotification, LocalDateTime createdAt) {
        this.id = id;
        this.system = system;
        this.title = title;
        this.content = content;
        this.phone = phone;
        this.email = email;
        this.isPublic = isPublic;
        this.smsNotification = smsNotification;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(String isPublic) {
        this.isPublic = isPublic;
    }

    public String getSmsNotification() {
        return smsNotification;
    }

    public void setSmsNotification(String smsNotification) {
        this.smsNotification = smsNotification;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}