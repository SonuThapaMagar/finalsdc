package com.furEverHome.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.furEverHome.entity.AdoptionRequestStatus;

public class AdoptionRequestResponse {

    private UUID id;
    private UUID userId;
    private String userEmail;
    private UUID petId;
    private String petName;
    private String motivation;
    private String livingSituation;
    private String experience;
    private AdoptionRequestStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private String petImage;

    // Add default no-args constructor
    public AdoptionRequestResponse() {
    }

    // Existing parameterized constructor
    public AdoptionRequestResponse(UUID id, UUID userId, String userEmail, UUID petId, String petName,
            String motivation, String livingSituation, String experience, AdoptionRequestStatus status,
            LocalDateTime submittedAt, LocalDateTime updatedAt, String petImage) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.petId = petId;
        this.petName = petName;
        this.motivation = motivation;
        this.livingSituation = livingSituation;
        this.experience = experience;
        this.status = status;
        this.submittedAt = submittedAt;
        this.updatedAt = updatedAt;
        this.petImage = petImage;
    }

    // Existing getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public UUID getPetId() {
        return petId;
    }

    public void setPetId(UUID petId) {
        this.petId = petId;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }

    public String getLivingSituation() {
        return livingSituation;
    }

    public void setLivingSituation(String livingSituation) {
        this.livingSituation = livingSituation;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public AdoptionRequestStatus getStatus() {
        return status;
    }

    public void setStatus(AdoptionRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPetImage() {
        return petImage;
    }

    public void setPetImage(String petImage) {
        this.petImage = petImage;
    }
}