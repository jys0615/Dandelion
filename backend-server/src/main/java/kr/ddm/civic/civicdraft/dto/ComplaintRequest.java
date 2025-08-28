package kr.ddm.civic.civicdraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {
    // 필수 공통 필드
    private String system; // SAFETY, DDM, SAEOL
    private String title; // 제목
    private String content; // 내용 (contents 대신 content로 통일)
    private String phone; // 전화번호
    private String email; // 이메일

    // 선택 공통 필드
    private String name; // 이름

    // 동적 필드 처리를 위한 Map - @Builder.Default로 경고 해결
    @Builder.Default
    private Map<String, Object> additionalProperties = new HashMap<>();

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        if (this.additionalProperties == null) {
            this.additionalProperties = new HashMap<>();
        }
        this.additionalProperties.put(name, value);
    }

    // 시스템별 필드 설정을 위한 헬퍼 메소드
    public void setReportType(String reportType) {
        setAdditionalProperty("reportType", reportType);
    }

    public void setContents(String contents) {
        this.content = contents;
    }

    public void setShareContent(String shareContent) {
        setAdditionalProperty("shareContent", shareContent);
    }

    public void setPersonType(String personType) {
        setAdditionalProperty("personType", personType);
    }

    public void setPrivacyAgree(boolean privacyAgree) {
        setAdditionalProperty("privacyAgree", privacyAgree);
    }

    public void setSmsNotification(String smsNotification) {
        setAdditionalProperty("smsNotification", smsNotification);
    }

    public void setIsPublic(String isPublic) {
        setAdditionalProperty("isPublic", isPublic);
    }

    public void setAddress(String address) {
        setAdditionalProperty("address", address);
    }

    public void setAddressDetail(String addressDetail) {
        setAdditionalProperty("addressDetail", addressDetail);
    }

    public void setZip(String zip) {
        setAdditionalProperty("zip", zip);
    }

    public void setEmailNotify(String emailNotify) {
        setAdditionalProperty("emailNotify", emailNotify);
    }

    public void setSmsNotify(String smsNotify) {
        setAdditionalProperty("smsNotify", smsNotify);
    }

    public void setTel(String tel) {
        setAdditionalProperty("tel", tel);
    }
}