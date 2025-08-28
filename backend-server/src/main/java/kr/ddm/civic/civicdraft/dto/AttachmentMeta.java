package kr.ddm.civic.civicdraft.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 첨부파일 메타데이터 DTO (파일 업로드/다운로드 API에서 실제 파일 관리)
 */
@Schema(description = "첨부파일 메타데이터 DTO. 실제 파일은 별도 API에서 관리.")
public class AttachmentMeta {
    @Schema(description = "파일명", example = "photo1.jpg")
    private String fileName;
    @Schema(description = "파일 타입", example = "image/jpeg")
    private String fileType;
    @Schema(description = "파일 크기(byte)", example = "123456")
    private long fileSize;
    @Schema(description = "파일 다운로드 URL", example = "/api/files/download/1")
    private String fileUrl;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}