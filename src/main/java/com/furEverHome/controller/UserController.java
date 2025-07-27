package com.furEverHome.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.furEverHome.dto.AdoptionRequestResponse;
import com.furEverHome.dto.AdoptionRequestSubmission;
import com.furEverHome.dto.LostFoundReportDTO;
import com.furEverHome.dto.PetResponse;
import com.furEverHome.dto.UserResponse;
import com.furEverHome.dto.UserUpdateRequest;
import com.furEverHome.entity.LostFoundReport;
import com.furEverHome.entity.Pet;
import com.furEverHome.entity.Role;
import com.furEverHome.repository.PetRepository;
import com.furEverHome.repository.UserRepository;
import com.furEverHome.service.AdoptionRequestService;
import com.furEverHome.service.FileStorageService;
import com.furEverHome.service.LostFoundReportService;
import com.furEverHome.service.PetService;
import com.furEverHome.service.UserService;
import com.furEverHome.util.JwtUtil;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private final PetRepository petRepository;
	private final JwtUtil jwtUtil;
	private final AdoptionRequestService adoptionRequestService;
	private final UserService userService;
	private final PetService petService;
	private final UserRepository userRepository;
	private final LostFoundReportService lostFoundReportService;

	@Autowired
	private FileStorageService fileStorageService;

	@Autowired
	public UserController(PetRepository petRepository, JwtUtil jwtUtil, AdoptionRequestService adoptionRequestService,
			UserService userService, PetService petService, UserRepository userRepository,LostFoundReportService lostFoundReportService) {
		this.petRepository = petRepository;
		this.jwtUtil = jwtUtil;
		this.adoptionRequestService = adoptionRequestService;
		this.userService = userService;
		this.petService = petService;
		this.userRepository = userRepository;
		this.lostFoundReportService = lostFoundReportService;
	}

	@PostMapping("/pets")
	public ResponseEntity<?> createPet(@RequestHeader("Authorization") String token, @RequestParam("name") String name,
			@RequestParam("breed") String breed, @RequestParam("age") int age, @RequestParam("gender") String gender,
			@RequestParam("description") String description, @RequestParam("location") String location,
			@RequestParam("status") String status, @RequestParam("centerId") UUID centerId,
			@RequestParam(value = "image", required = false) MultipartFile image) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.USER)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have USER role to create a pet"));
		}

		try {
			String imageUrl = null;
			if (image != null && !image.isEmpty()) {
				imageUrl = fileStorageService.storeFile(image, centerId.toString(), "pet");
			}

			Pet pet = new Pet(name, breed, age, gender, description, location, status, centerId, imageUrl);
			pet = petRepository.save(pet);
			return ResponseEntity.status(201)
					.body(new SuccessResponse("Pet created successfully",
							new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
									pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId(),
									pet.getImageUrl())));
		} catch (IOException e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to upload image: " + e.getMessage()));
		}
	}

	@GetMapping("/pets/{id}")
	public ResponseEntity<?> getPetById(@PathVariable UUID id) {
		Optional<Pet> pet = petRepository.findById(id);
		if (!pet.isPresent() || !pet.get().getStatus().equals("AVAILABLE")) {
			return ResponseEntity.status(404).body(new AuthController.ErrorResponse("Pet not found or not available"));
		}
		PetResponse petResponse = new PetResponse(pet.get().getId(), pet.get().getName(), pet.get().getBreed(),
				pet.get().getAge(), pet.get().getGender(), pet.get().getDescription(), pet.get().getLocation(),
				pet.get().getStatus(), pet.get().getCenterId(), pet.get().getImageUrl());
		return ResponseEntity.ok(petResponse);
	}

	@GetMapping("/pets")
	public ResponseEntity<?> viewPets() {
		List<Pet> pets = petRepository.findAll().stream().filter(pet -> pet.getStatus().equals("AVAILABLE"))
				.collect(Collectors.toList());
		List<PetResponse> petResponses = pets.stream()
				.map(pet -> new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
						pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId(), pet.getImageUrl()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(petResponses);
	}

	@GetMapping("/pets/search")
	public ResponseEntity<?> searchPets(@RequestParam String query, @RequestParam String location,
			@RequestHeader("Authorization") String token) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.USER)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have USER role to search pets"));
		}

		List<Pet> pets = petRepository.findAll().stream()
				.filter(pet -> pet.getName().toLowerCase().contains(query.toLowerCase())
						&& pet.getLocation().toLowerCase().contains(location.toLowerCase())
						&& pet.getStatus().equals("AVAILABLE"))
				.collect(Collectors.toList());

		List<PetResponse> petResponses = pets.stream()
				.map(pet -> new PetResponse(pet.getId(), pet.getName(), pet.getBreed(), pet.getAge(), pet.getGender(),
						pet.getDescription(), pet.getLocation(), pet.getStatus(), pet.getCenterId()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(petResponses);
	}

	@PostMapping("/adoption-request")
	public ResponseEntity<?> submitAdoptionRequest(@RequestHeader("Authorization") String token,
			@RequestBody AdoptionRequestSubmission requestDTO) {
		String email = jwtUtil.getEmailFromToken(token.substring(7));
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.USER)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have USER role to submit an adoption request"));
		}

		try {
			AdoptionRequestResponse responseDTO = adoptionRequestService.submitAdoptionRequest(email, requestDTO);
			return ResponseEntity.status(201)
					.body(new SuccessResponse("Adoption request submitted successfully", responseDTO));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to submit adoption request: " + e.getMessage()));
		}
	}

	@GetMapping("/adoption-history")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<?> getAdoptionHistory(@RequestHeader("Authorization") String token) {
		String tokenValue = token.substring(7); // Remove "Bearer " prefix
		String email = jwtUtil.getEmailFromToken(tokenValue);
		if (email == null) {
			return ResponseEntity.status(401).body(new AuthController.ErrorResponse("Invalid token"));
		}

		try {
			List<AdoptionRequestResponse> adoptionRequests = adoptionRequestService
					.getAdoptionRequestsByUserEmail(email);
			return ResponseEntity.ok(new SuccessResponse("Adoption history fetched successfully", adoptionRequests));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch adoption history: " + e.getMessage()));
		}
	}
	
	@PostMapping("/lost-found")
	public ResponseEntity<?> submitLostFoundReport(
	        @RequestHeader("Authorization") String token,
	        @RequestParam("image") MultipartFile image,
	        @RequestParam("location") String location,
	        @RequestParam("description") String description,
	        @RequestParam("petCenterId") UUID petCenterId) {

	    String tokenValue = token.substring(7); // Remove "Bearer " prefix
	    if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.USER)) {
	        return ResponseEntity.status(403)
	                .body(new AuthController.ErrorResponse("User must have USER role to submit a lost/found report"));
	    }

	    try {
	        LostFoundReportDTO reportDTO = new LostFoundReportDTO(image, location, description, petCenterId);
	        LostFoundReport report = lostFoundReportService.submitLostFoundReport(tokenValue, reportDTO);
	        return ResponseEntity.status(201)
	                .body(new SuccessResponse("Lost/Found report submitted successfully", mapToResponse(report)));
	    } catch (IOException e) {
	        return ResponseEntity.status(500)
	                .body(new AuthController.ErrorResponse("Failed to upload image: " + e.getMessage()));
	    } catch (IllegalArgumentException | IllegalStateException e) {
	        return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
	    } catch (Exception e) {
	        return ResponseEntity.status(500)
	                .body(new AuthController.ErrorResponse("Failed to submit report: " + e.getMessage()));
	    }
	}

	private LostFoundReportResponse mapToResponse(LostFoundReport report) {
	    return new LostFoundReportResponse(
	        report.getId(),
	        report.getImageUrl(),
	        report.getLocation(),
	        report.getDescription(),
	        report.getPetCenterId(),
	        report.getUser() != null ? report.getUser().getId() : null
	    );
	}

	static class LostFoundReportResponse {
	    private UUID id;
	    private String imageUrl;
	    private String location;
	    private String description;
	    private UUID petCenterId;
	    private UUID userId;

	    public LostFoundReportResponse(UUID id, String imageUrl, String location, String description, 
	            UUID petCenterId, UUID userId) {
	        this.id = id;
	        this.imageUrl = imageUrl;
	        this.location = location;
	        this.description = description;
	        this.petCenterId = petCenterId;
	        this.userId = userId;
	    }

	    // Getters
	    public UUID getId() { return id; }
	    public String getImageUrl() { return imageUrl; }
	    public String getLocation() { return location; }
	    public String getDescription() { return description; }
	    public UUID getPetCenterId() { return petCenterId; }
	    public UUID getUserId() { return userId; }
	}

	@GetMapping("/profile")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
		String tokenValue = token.substring(7); // Remove "Bearer " prefix
		String email = jwtUtil.getEmailFromToken(tokenValue);
		if (email == null) {
			return ResponseEntity.status(401).body(new AuthController.ErrorResponse("Invalid token"));
		}

		try {
			UserResponse userProfile = userService.getUserById(userRepository.findByEmail(email)
					.orElseThrow(() -> new IllegalArgumentException("User not found")).getId());
			return ResponseEntity.ok(new SuccessResponse("Profile fetched successfully", userProfile));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch profile: " + e.getMessage()));
		}
	}
	
	@PutMapping("/profile")
	public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token,
			@RequestBody UserUpdateRequest updateRequest) {

		String tokenValue = token.substring(7); // Remove "Bearer " prefix
		if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.USER)) {
			return ResponseEntity.status(403)
					.body(new AuthController.ErrorResponse("User must have USER role to update profile"));
		}

		try {
			String email = jwtUtil.getEmailFromToken(tokenValue);
			UserResponse updatedProfile = userService.updateUserProfile(email, updateRequest, Role.USER);
			return ResponseEntity.ok(new SuccessResponse("Profile updated successfully", updatedProfile));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to update profile: " + e.getMessage()));
		}
	}

	static class SuccessResponse {
		private String message;
		private Object data;

		public SuccessResponse(String message, Object data) {
			this.message = message;
			this.data = data;
		}

		public String getMessage() {
			return message;
		}

		public Object getData() {
			return data;
		}
	}

}