package com.furEverHome.dto;

import java.time.LocalDateTime;

public class RecentActivityResponse {
    private String type;
    private String icon;
    private String bgColor;
    private String title;
    private String description;
    private String time;
    private LocalDateTime timestamp;

    public RecentActivityResponse(String type, String icon, String bgColor, String title, String description, String time,LocalDateTime timestamp) {
        this.type = type;
        this.icon = icon;
        this.bgColor = bgColor;
        this.title = title;
        this.description = description;
        this.time = time;
        this.timestamp = timestamp; 
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}