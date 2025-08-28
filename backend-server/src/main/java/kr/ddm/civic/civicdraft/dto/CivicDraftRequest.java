package kr.ddm.civic.civicdraft.dto;

public class CivicDraftRequest {
    private String userText;
    private boolean photos;
    private boolean videos;
    private String locationText;
    private String legalCandidatesJson;

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
}
