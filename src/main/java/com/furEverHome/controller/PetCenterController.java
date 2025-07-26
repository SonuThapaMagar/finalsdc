package com.furEverHome.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.furEverHome.dto.PetRequest;
import com.furEverHome.dto.PetResponse;
import com.furEverHome.entity.Pet;
import com.furEverHome.entity.PetCenter;
import com.furEverHome.entity.Role;
import com.furEverHome.repository.PetCenterRepository;
import com.furEverHome.repository.PetRepository;
import com.furEverHome.util.JwtUtil;

@RestController
@RequestMapping("/api/admin")
public class PetCenterController {

	private final PetCenterRepository petCenterRepository;
	private final PetRepository petRepository;
	private final JwtUtil jwtUtil;

	@Autowired
	public PetCenterController(PetCenterRepository petCenterRepository, PetRepository petRepository, JwtUtil jwtUtil) {
		this.petCenterRepository = petCenterRepository;
		this.petRepository = petRepository;
		this.jwtUtil = jwtUtil;
	}

	@PostMapping("/pets")
	public ResponseEntity<?> addPet(@RequestBody PetRequest request, @RequestHeader("Authorization") String token) {

		// Extract email from the token
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		// Validate that the user is a Pet Center Admin
		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}

		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to add pets"));
		}

		// Create a new Pet entity
		Pet pet = new Pet(request.getName(), request.getBreed(), request.getAge(), request.getGender(),
				request.getDescription(), request.getLocation(), request.getStatus(), petCenter.getId());
		petRepository.save(pet);

		PetResponse petResponse = new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(),
				pet.getGender(), pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId());
		return ResponseEntity.status(201).body(petResponse);
	}

	@GetMapping("/pets")
	public ResponseEntity<?> viewPets(@RequestHeader("Authorization") String token) {
		// Extract email from the token
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		// Validate that the user is a Pet Center Admin
		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to view pets"));
		}

		// Retrieve and map pets for this Pet Center
		List<Pet> pets = petRepository.findByCenterId(petCenter.getId());
		List<PetResponse> petResponses = pets.stream()
				.map(pet -> new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
						pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId()))
				.collect(Collectors.toList());

		return ResponseEntity.ok(petResponses);
	}

	@GetMapping("/pets/search")
	public ResponseEntity<?> searchPets(@RequestParam String query, @RequestParam String location,
			@RequestHeader("Authorization") String token) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to search pets"));
		}

		if (query == null || query.trim().isEmpty() || location == null || location.trim().isEmpty()) {
			return ResponseEntity.status(400)
					.body(new AuthController.ErrorResponse("Query and location parameters are required"));
		}

		List<Pet> pets = petRepository.searchByCenterIdAndNameAndLocation(petCenter.getId(), query, location);
		List<PetResponse> petResponses = pets.stream()
				.map(pet -> new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
						pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(petResponses);
	}

	@PutMapping("/pets/{id}")
	public ResponseEntity<?> updatePet(@PathVariable UUID id, @RequestBody PetRequest request,
			@RequestHeader("Authorization") String token) {
		// Extract email from the token
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		// Validate that the user is a Pet Center Admin
		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to update pets"));
		}

		// Find and validate pet ownership
		Pet pet = petRepository.findById(id).filter(p -> p.getCenterId().equals(petCenter.getId())).orElse(null);
		if (pet == null) {
			return ResponseEntity.status(404)
					.body(new AuthController.ErrorResponse("Pet not found or not owned by this Pet Center"));
		}
		// Update pet details
		pet.setName(request.getName());
		pet.setBreed(request.getBreed());
		pet.setAge(request.getAge());
		pet.setGender(request.getGender());
		pet.setDescription(request.getDescription());
		pet.setLocation(request.getLocation());
		pet.setStatus(request.getStatus());
		petRepository.save(pet);

		PetResponse petResponse = new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(),
				pet.getGender(), pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId());
		return ResponseEntity.ok(petResponse);
	}

	@DeleteMapping("/pets/{id}")
	public ResponseEntity<?> deletePet(@PathVariable UUID id, @RequestHeader("Authorization") String token) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to delete pets"));
		}

		Pet pet = petRepository.findById(id).filter(p -> p.getCenterId().equals(petCenter.getId())).orElse(null);
		if (pet == null) {
			return ResponseEntity.status(404)
					.body(new AuthController.ErrorResponse("Pet not found or not owned by this Pet Center"));
		}

		petRepository.delete(pet);
		return ResponseEntity.ok(new AuthController.SuccessResponse("Pet deleted successfully", id));
	}
}
