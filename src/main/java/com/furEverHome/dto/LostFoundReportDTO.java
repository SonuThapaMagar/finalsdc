package com.furEverHome.dto;

import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public class LostFoundReportDTO {

    private MultipartFile image;
    private String location;
    private String description;
    private UUID petCenterId;

    // Constructors
    public LostFoundReportDTO() {}

    public LostFoundReportDTO(MultipartFile image, String location, String description, UUID petCenterId) {
        this.image = image;
        this.location = location;
        this.description = description;
        this.petCenterId = petCenterId;
    }

    // Getters and Setters
    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getPetCenterId() {
        return petCenterId;
    }

    public void setPetCenterId(UUID petCenterId) {
        this.petCenterId = petCenterId;
    }
}