package com.furEverHome.controller;

import com.furEverHome.dto.PetRequest;
import com.furEverHome.dto.PetResponse;
import com.furEverHome.entity.AdoptionRequest;
import com.furEverHome.entity.AdoptionRequestStatus;
import com.furEverHome.entity.Pet;
import com.furEverHome.entity.PetCenter;
import com.furEverHome.entity.Role;
import com.furEverHome.repository.AdoptionRequestRepository;
import com.furEverHome.repository.PetCenterRepository;
import com.furEverHome.repository.PetRepository;
import com.furEverHome.service.FileStorageService;
import com.furEverHome.util.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class PetCenterController {

	private final PetCenterRepository petCenterRepository;
	private final PetRepository petRepository;
	private final JwtUtil jwtUtil;
	private final AdoptionRequestRepository adoptionRequestRepository;
	private final FileStorageService fileStorageService;

	@Autowired
	public PetCenterController(PetCenterRepository petCenterRepository, PetRepository petRepository, JwtUtil jwtUtil,
			AdoptionRequestRepository adoptionRequestRepository, FileStorageService fileStorageService) {
		this.petCenterRepository = petCenterRepository;
		this.petRepository = petRepository;
		this.jwtUtil = jwtUtil;
		this.adoptionRequestRepository = adoptionRequestRepository;
		this.fileStorageService = fileStorageService;
	}

	@GetMapping("/dashboard/stats")
	public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String authHeader) {
		try {
			String token = authHeader.replace("Bearer ", "");
			if (!jwtUtil.validateToken(token)) {
				return ResponseEntity.status(401).body("Invalid token");
			}
			Role role = jwtUtil.getRoleFromToken(token);
			if (!Role.ADMIN.equals(role)) {
				return ResponseEntity.status(403).body("Access denied: ADMIN role required");
			}

			String email = jwtUtil.getEmailFromToken(token);
			PetCenter petCenter = petCenterRepository.findByEmail(email)
					.orElseThrow(() -> new IllegalArgumentException("Pet Center not found for email: " + email));

			long totalUsers = petCenterRepository.count();
			long totalPets = petRepository.countByCenterId(petCenter.getId());
			long totalAdoptionRequests = adoptionRequestRepository.countByPetCenterId(petCenter.getId());
			long totalAdoptions = adoptionRequestRepository.countByStatusAndPetCenterId(AdoptionRequestStatus.ACCEPTED,
					petCenter.getId());

			Map<String, Long> stats = new HashMap<>();
			stats.put("totalUsers", totalUsers);
			stats.put("totalPets", totalPets);
			stats.put("totalAdoptionRequests", totalAdoptionRequests);
			stats.put("totalAdoptions", totalAdoptions);

			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error fetching dashboard stats: " + e.getMessage());
		}
	}
	
	@GetMapping("/dashboard/monthly-adoptions")
	public ResponseEntity<?> getMonthlyAdoptions(@RequestHeader("Authorization") String authHeader) {
	    try {
	        String token = authHeader.replace("Bearer ", "");
	        if (!jwtUtil.validateToken(token)) {
	            return ResponseEntity.status(401).body(new AuthController.ErrorResponse("Invalid token"));
	        }
	        Role role = jwtUtil.getRoleFromToken(token);
	        if (!Role.ADMIN.equals(role)) {
	            return ResponseEntity.status(403).body(new AuthController.ErrorResponse("Access denied: ADMIN role required"));
	        }

	        String email = jwtUtil.getEmailFromToken(token);
	        PetCenter petCenter = petCenterRepository.findByEmail(email)
	                .orElseThrow(() -> new IllegalArgumentException("Pet Center not found for email: " + email));

	        List<AdoptionRequest> requests = adoptionRequestRepository.findByPetCenterIdAndStatus(
	            petCenter.getId(), AdoptionRequestStatus.ACCEPTED
	        );
	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
	        Map<String, Long> monthlyAdoptions = requests.stream()
	            .collect(Collectors.groupingBy(
	                request -> request.getSubmittedAt().format(formatter),
	                Collectors.counting()
	            ));

	        List<Map<String, Object>> barData = monthlyAdoptions.entrySet().stream()
	            .map(entry -> {
	                Map<String, Object> data = new HashMap<>();
	                data.put("month", entry.getKey());
	                data.put("adoptions", entry.getValue());
	                return data;
	            })
	            .collect(Collectors.toList());

	        return ResponseEntity.ok(barData);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body(new AuthController.ErrorResponse("Error fetching monthly adoptions: " + e.getMessage()));
	    }
	}

	@PostMapping("/pets")
	public ResponseEntity<?> addPet(@RequestParam("name") String name, @RequestParam("breed") String breed,
	        @RequestParam("age") int age, @RequestParam("gender") String gender,
	        @RequestParam("description") String description, @RequestParam("location") String location,
	        @RequestParam("status") String status,
	        @RequestPart(value = "image", required = false) MultipartFile image,
	        @RequestHeader("Authorization") String token) {

	    Logger logger = LoggerFactory.getLogger(PetCenterController.class);
	    String authToken = token.substring(7); // Remove "Bearer "
	    String email = jwtUtil.getEmailFromToken(authToken);
	    logger.info("Attempting to find PetCenter for email: {}", email);
	    PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);
	    logger.info("PetCenter found: {}", (petCenter != null ? petCenter.getId() : "null"));

	    if (petCenter == null) {
	        return ResponseEntity.status(403)
	                .body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
	    }

	    Role role = jwtUtil.getRoleFromToken(authToken);
	    logger.info("Role from token: {}", role);
	    if (!Role.ADMIN.equals(role)) {
	        return ResponseEntity.status(403).body(
	                new AuthController.ErrorResponse("User must have ADMIN role to add pets. Role found: " + role));
	    }

	    String imageUrl = null;
	    if (image != null && !image.isEmpty()) {
	        try {
	            imageUrl = fileStorageService.storeFile(image, petCenter.getId().toString(), "pet");
	        } catch (IOException e) {
	            return ResponseEntity.status(500)
	                    .body(new AuthController.ErrorResponse("Failed to upload image: " + e.getMessage()));
	        }
	    }

	    Pet pet = new Pet(name, breed, age, gender, description, location, status, petCenter.getId(), imageUrl);
	    logger.info("Creating pet with center_id: {}", petCenter.getId());
	    petRepository.save(pet);

	    PetResponse petResponse = new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(),
	            pet.getGender(), pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId(), pet.getImageUrl());
	    return ResponseEntity.status(201).body(petResponse);
	}

	@GetMapping("/pets")
	public ResponseEntity<?> viewPets(@RequestHeader("Authorization") String token) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);

		if (petCenter == null) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
		}
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.ADMIN)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have ADMIN role to view pets"));
		}

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
	public ResponseEntity<?> updatePet(@PathVariable UUID id,
	        @RequestParam("name") String name,
	        @RequestParam("breed") String breed,
	        @RequestParam("age") int age,
	        @RequestParam("gender") String gender,
	        @RequestParam("description") String description,
	        @RequestParam("location") String location,
	        @RequestParam("status") String status,
	        @RequestPart(value = "image", required = false) MultipartFile image,
	        @RequestHeader("Authorization") String token) {

	    Logger logger = LoggerFactory.getLogger(PetCenterController.class);
	    String authToken = token.substring(7); // Remove "Bearer "
	    logger.info("Received token for updatePet: {}", authToken);
	    String email = jwtUtil.getEmailFromToken(authToken);
	    logger.info("Extracted email from token: {}", email);

	    PetCenter petCenter = petCenterRepository.findByEmail(email).orElse(null);
	    if (petCenter == null) {
	        logger.warn("Pet Center not found for email: {}", email);
	        return ResponseEntity.status(403)
	                .body(new AuthController.ErrorResponse("Pet Center not found for email: " + email));
	    }
	    logger.info("PetCenter found with ID: {}", petCenter.getId());

	    Role role = jwtUtil.getRoleFromToken(authToken);
	    logger.info("Role extracted from token: {}", role);
	    if (!Role.ADMIN.equals(role)) {
	        logger.warn("Insufficient role for update: {}", role);
	        return ResponseEntity.status(403)
	                .body(new AuthController.ErrorResponse("User must have ADMIN role to update pets. Role found: " + role));
	    }

	    Pet pet = petRepository.findById(id).filter(p -> p.getCenterId().equals(petCenter.getId())).orElse(null);
	    if (pet == null) {
	        logger.warn("Pet not found or not owned by Pet Center for id: {}", id);
	        return ResponseEntity.status(404)
	                .body(new AuthController.ErrorResponse("Pet not found or not owned by this Pet Center"));
	    }

	    String imageUrl = pet.getImageUrl();
	    if (image != null && !image.isEmpty()) {
	        try {
	            imageUrl = fileStorageService.storeFile(image, petCenter.getId().toString(), "pet");
	            logger.info("New image uploaded for pet {} with URL: {}", id, imageUrl);
	        } catch (IOException e) {
	            logger.error("Failed to upload image for pet {}: {}", id, e.getMessage());
	            return ResponseEntity.status(500)
	                    .body(new AuthController.ErrorResponse("Failed to upload image: " + e.getMessage()));
	        }
	    }

	    pet.setName(name);
	    pet.setBreed(breed);
	    pet.setAge(age);
	    pet.setGender(gender);
	    pet.setDescription(description);
	    pet.setLocation(location);
	    pet.setStatus(status);
	    pet.setImageUrl(imageUrl);
	    petRepository.save(pet);
	    logger.info("Pet {} updated successfully with center_id: {}", id, pet.getCenterId());

	    PetResponse petResponse = new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(),
	            pet.getGender(), pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId(), pet.getImageUrl());
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

	@GetMapping("/dashboard")
	public ResponseEntity<?> getDashboard(@RequestHeader("Authorization") String authHeader) {
		try {
			String token = authHeader.replace("Bearer ", "");
			if (!jwtUtil.validateToken(token)) {
				return ResponseEntity.status(401).body("Invalid token");
			}
			Role role = jwtUtil.getRoleFromToken(token);
			if (!Role.ADMIN.equals(role)) {
				return ResponseEntity.status(403).body("Access denied: ADMIN role required");
			}
			return ResponseEntity.ok("Welcome to Admin Dashboard");
		} catch (Exception e) {
			return ResponseEntity.status(401).body("Unauthorized: " + e.getMessage());
		}
	}
}