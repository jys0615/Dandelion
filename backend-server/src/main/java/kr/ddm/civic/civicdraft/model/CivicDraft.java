package kr.ddm.civic.civicdraft.model;

import jakarta.persistence.*;

@Entity
public class CivicDraft {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userText;
    private boolean photos;
    private boolean videos;
    private String locationText;
    private String legalCandidatesJson;
    @Column(columnDefinition = "TEXT")
    private String body; // 초안 본문

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserText() { return userText; }
    public void setUserText(String userText) { this.userText = userText; }
    public boolean isPhotos() { return photos; }
    public void setPhotos(boolean photos) { this.photos = photos; }
    public boolean isVideos() { return videos; }
    public void setVideos(boolean videos) { this.videos = videos; }
    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }
    public String getLegalCandidatesJson() { return legalCandidatesJson; }
    public void setLegalCandidatesJson(String legalCandidatesJson) { this.legalCandidatesJson = legalCandidatesJson; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
