package com.furEverHome.repository;

import com.furEverHome.entity.AdoptionRequest;
import com.furEverHome.entity.AdoptionRequestStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, UUID> {
	List<AdoptionRequest> findByPetId(UUID petId);

	List<AdoptionRequest> findByUserId(UUID userId);

	long countByPetCenterId(UUID id);

	long countByStatusAndPetCenterId(AdoptionRequestStatus status, UUID id);
}