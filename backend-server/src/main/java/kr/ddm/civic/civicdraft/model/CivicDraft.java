package kr.ddm.civic.civicdraft.model;

import jakarta.persistence.*;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 민원 초안 DB 엔티티
 */
@Schema(description = "민원 초안 DB 엔티티. 본문 및 공개/비공개 여부 저장.")
@Entity
public class CivicDraft {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "DB PK", example = "1")
    private Long id;
    @Column(columnDefinition = "TEXT")
    @Schema(description = "초안 본문", example = "안녕하십니까. ...")
    private String body;

    @Column(name = "public_visibility", length = 16)
    @Schema(description = "공개/비공개", example = "public")
    private String publicVisibility;

    public String getPublicVisibility() { return publicVisibility; }
    public void setPublicVisibility(String publicVisibility) { this.publicVisibility = publicVisibility; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
