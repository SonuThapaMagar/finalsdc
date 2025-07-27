// com.furEverHome.entity.LostFoundReport.java
package com.furEverHome.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class LostFoundReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String imageUrl;
    private String location;
    private String description;
    private UUID petCenterId;

    @ManyToOne
    private User user; // Relationship to the User entity

    // Constructors
    public LostFoundReport() {}

    public LostFoundReport(String imageUrl, String location, String description, UUID petCenterId, User user) {
        this.imageUrl = imageUrl;
        this.location = location;
        this.description = description;
        this.petCenterId = petCenterId;
        this.user = user;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}