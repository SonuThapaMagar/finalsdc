package com.furEverHome.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.furEverHome.entity.Pet;

public interface PetRepository extends JpaRepository<Pet, UUID> {
    List<Pet> findByCenterId(UUID centerId);
    Optional<Pet> findById(UUID id);

    @Query("SELECT p FROM Pet p WHERE p.centerId = :centerId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Pet> searchByCenterIdAndNameAndLocation(@Param("centerId") UUID centerId, @Param("name") String name, @Param("location") String location);
}