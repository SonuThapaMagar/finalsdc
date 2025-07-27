package com.furEverHome.service;

import com.furEverHome.dto.PetRequest;
import com.furEverHome.dto.PetResponse;
import com.furEverHome.entity.Pet;
import com.furEverHome.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PetService {

	private final PetRepository petRepository;

	@Autowired
	public PetService(PetRepository petRepository) {
		this.petRepository = petRepository;
	}

	public Page<PetResponse> getAllPets(Pageable pageable) {
        try {
            return petRepository.findAll(pageable).map(this::mapToPetResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch pets: " + e.getMessage(), e);
        }
    }

	public Pet getPetById(UUID id) {
		return petRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Pet not found with id: " + id));
	}

	@Transactional
	public PetResponse updatePet(UUID id, PetRequest updateRequest) {
		Pet pet = petRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + id));

		if (updateRequest.getName() != null) {
			pet.setName(updateRequest.getName());
		}
		if (updateRequest.getBreed() != null) {
			pet.setBreed(updateRequest.getBreed());
		}
		if (updateRequest.getAge() > 0) {
			pet.setAge(updateRequest.getAge());
		}
		if (updateRequest.getGender() != null) {
			pet.setGender(updateRequest.getGender());
		}
		if (updateRequest.getDescription() != null) {
			pet.setDescription(updateRequest.getDescription());
		}
		if (updateRequest.getLocation() != null) {
			pet.setLocation(updateRequest.getLocation());
		}
		if (updateRequest.getStatus() != null) {
			pet.setStatus(updateRequest.getStatus());
		}
		if (updateRequest.getCenterId() != null) {
			pet.setCenterId(updateRequest.getCenterId());
		}

		try {
			pet = petRepository.save(pet);
			return mapToPetResponse(pet);
		} catch (Exception e) {
			throw new RuntimeException("Failed to update pet: " + e.getMessage(), e);
		}
	}

	@Transactional
	public void deletePet(UUID id) {
		Pet pet = petRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + id));
		petRepository.delete(pet);
	}

	public PetResponse mapToPetResponse(Pet pet) {
		return new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
				pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId(), pet.getImageUrl());
	}
}