package kr.ddm.civic.civicdraft.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookmarkletResponse {
    private boolean success;
    private String message;
    private String templateId;
    private String system;
    private String systemName;
    private String siteUrl;
    private String bookmarkletUrl;
    private String bookmarkletCode;
    private String createdAt;
    private Map<String, Object> requestData;
}