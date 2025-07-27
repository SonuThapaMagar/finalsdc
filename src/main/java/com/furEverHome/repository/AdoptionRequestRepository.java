package com.furEverHome.repository;

import com.furEverHome.entity.AdoptionRequest;
import com.furEverHome.entity.AdoptionRequestStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, UUID> {
	List<AdoptionRequest> findByPetId(UUID petId);

	List<AdoptionRequest> findByUserId(UUID userId);

	long countByPetCenterId(UUID petCenterId);

    long countByStatusAndPetCenterId(AdoptionRequestStatus status, UUID petCenterId);

    @Query("SELECT ar FROM AdoptionRequest ar JOIN ar.pet p WHERE p.centerId = :petCenterId")
    Page<AdoptionRequest> findByPetCenterId(@Param("petCenterId") UUID petCenterId, Pageable pageable);
    }