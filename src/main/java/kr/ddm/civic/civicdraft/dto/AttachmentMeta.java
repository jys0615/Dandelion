package kr.ddm.civic.civicdraft.dto;

/**
 * 첨부파일 메타데이터 DTO (파일 업로드/다운로드 API에서 실제 파일 관리)
 */
public class AttachmentMeta {
    private String fileName;
    private String fileType;
    private long fileSize;
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