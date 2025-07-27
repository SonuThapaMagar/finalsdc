package com.furEverHome.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.furEverHome.dto.AdminProfileResponse;
import com.furEverHome.dto.AdminProfileUpdateRequest;
import com.furEverHome.dto.DashboardStatsResponse;
import com.furEverHome.dto.MonthlyStatsResponse;
import com.furEverHome.dto.PetRequest;
import com.furEverHome.dto.PetResponse;
import com.furEverHome.dto.PetStatusResponse;
import com.furEverHome.dto.RecentActivityResponse;
import com.furEverHome.dto.UserResponse;
import com.furEverHome.dto.UserUpdateRequest;
import com.furEverHome.entity.Pet;
import com.furEverHome.entity.PetCenter;
import com.furEverHome.entity.Role;
import com.furEverHome.service.DashboardService;
import com.furEverHome.service.PetCenterService;
import com.furEverHome.service.PetService;
import com.furEverHome.service.UserService;
import com.furEverHome.util.JwtUtil;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final PetCenterService petCenterService;
	private final PetService petService;
	private final DashboardService dashboardService;

	@Autowired
	public SuperAdminController(JwtUtil jwtUtil, UserService userService, PetCenterService petCenterService,
			PetService petService, DashboardService dashboardService) {
		this.jwtUtil = jwtUtil;
		this.userService = userService;
		this.petCenterService = petCenterService;
		this.petService = petService;
		this.dashboardService = dashboardService;
	}

	@GetMapping("/users")
	public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			Pageable pageable = PageRequest.of(page, size); // Zero-based page
			Page<UserResponse> userPage = userService.getAllUsers(pageable);
			return ResponseEntity.ok(userPage); // Returns Page object
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch users: " + e.getMessage()));
		}
	}

	@GetMapping("/users/{id}")
	public ResponseEntity<?> getUserById(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			UserResponse user = userService.getUserById(id);
			return ResponseEntity.ok(user);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch user: " + e.getMessage()));
		}
	}

	@PutMapping("/users/{id}")
	public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String token, @PathVariable UUID id,
			@RequestBody UserUpdateRequest updateRequest) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			UserResponse updatedUser = userService.updateUser(id, updateRequest);
			return ResponseEntity.ok(new SuccessResponse("User updated successfully", updatedUser));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to update user: " + e.getMessage()));
		}
	}

	@DeleteMapping("/users/{id}")
	public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			userService.deleteUser(id);
			return ResponseEntity.ok(new SuccessResponse("User deleted successfully", null));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to delete user: " + e.getMessage()));
		}
	}

	@GetMapping("/pet-centers")
	public ResponseEntity<?> getAllPetCenters(@RequestHeader("Authorization") String token) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		List<AdminProfileResponse> petCenters = petCenterService.getAllPetCenters();
		return ResponseEntity.ok(petCenters);
	}

//	@GetMapping("/pet-centers/{id}")
//	public ResponseEntity<?> getPetCenterById(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
//		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
//			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
//		}
//		try {
//			PetCenter petCenter = petCenterService.getPetCenterById(id);
//			AdminProfileResponse response = mapToAdminProfileResponse(petCenter);
//			return ResponseEntity.ok(response);
//		} catch (IllegalArgumentException e) {
//			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
//		} catch (Exception e) {
//			return ResponseEntity.status(500)
//					.body(new AuthController.ErrorResponse("Failed to fetch pet center: " + e.getMessage()));
//		}
//	}
	@GetMapping("/pet-centers/{id}")
	public ResponseEntity<?> getPetCenterById(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
	    if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
	        return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
	    }
	    try {
	        PetCenter petCenter = petCenterService.getPetCenterById(id);
	        if (petCenter == null) {
	            return ResponseEntity.status(404).body(new AuthController.ErrorResponse("Pet center not found"));
	        }
	        AdminProfileResponse response = mapToAdminProfileResponse(petCenter);
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        return ResponseEntity.status(500)
	                .body(new AuthController.ErrorResponse("Failed to fetch pet center: " + e.getMessage()));
	    }
	}

	@PutMapping("/pet-centers/{id}")
	public ResponseEntity<?> updatePetCenter(@RequestHeader("Authorization") String token, @PathVariable UUID id,
			@RequestBody AdminProfileUpdateRequest updateRequest) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			AdminProfileResponse updatedPetCenter = petCenterService.updatePetCenter(id, updateRequest);
			return ResponseEntity.ok(new SuccessResponse("Pet Center updated successfully", updatedPetCenter));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to update pet center: " + e.getMessage()));
		}
	}

	@DeleteMapping("/pet-centers/{id}")
	public ResponseEntity<?> deletePetCenter(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			petCenterService.deletePetCenter(id);
			return ResponseEntity.ok(new SuccessResponse("Pet Center deleted successfully", null));
		} catch (IllegalArgumentException | IllegalStateException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to delete pet center: " + e.getMessage()));
		}
	}

//	@GetMapping("/pets")
//	public ResponseEntity<?> getAllPets(@RequestHeader("Authorization") String token) {
//		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
//			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
//		}
//		try {
//			List<PetResponse> pets = petService.getAllPets();
//			return ResponseEntity.ok(pets);
//		} catch (Exception e) {
//			return ResponseEntity.status(500)
//					.body(new AuthController.ErrorResponse("Failed to fetch pets: " + e.getMessage()));
//		}
//	}
	@GetMapping("/pets")
	public ResponseEntity<?> getAllPets(@RequestHeader("Authorization") String token,
	                                   @RequestParam(defaultValue = "0") int page,
	                                   @RequestParam(defaultValue = "5") int size) {
	    if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
	        return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
	    }
	    try {
	        Pageable pageable = PageRequest.of(page, size); // Zero-based page
	        Page<PetResponse> petPage = petService.getAllPets(pageable);
	        return ResponseEntity.ok(petPage);
	    } catch (Exception e) {
	        return ResponseEntity.status(500)
	                .body(new AuthController.ErrorResponse("Failed to fetch pets: " + e.getMessage()));
	    }
	}

	@GetMapping("/pets/{id}")
	public ResponseEntity<?> getPetById(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			Pet pet = petService.getPetById(id);
			PetResponse response = mapToPetResponse(pet);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch pet: " + e.getMessage()));
		}
	}

	@PutMapping("/pets/{id}")
	public ResponseEntity<?> updatePet(@RequestHeader("Authorization") String token, @PathVariable UUID id,
			@RequestBody PetRequest petRequest) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			PetResponse updatedPet = petService.updatePet(id, petRequest);
			return ResponseEntity.ok(new SuccessResponse("Pet updated successfully", updatedPet));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(400).body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to update pet: " + e.getMessage()));
		}
	}

	@DeleteMapping("/pets/{id}")
	public ResponseEntity<?> deletePet(@RequestHeader("Authorization") String token, @PathVariable UUID id) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			petService.deletePet(id);
			return ResponseEntity.ok(new SuccessResponse("Pet deleted successfully", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to delete pet: " + e.getMessage()));
		}
	}

	@GetMapping("/dashboard/stats")
	public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String token) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			DashboardStatsResponse stats = dashboardService.getDashboardStats();
			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch dashboard stats: " + e.getMessage()));
		}
	}

	@GetMapping("/dashboard/monthly-stats")
	public ResponseEntity<?> getMonthlyStats(@RequestHeader("Authorization") String token) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			List<MonthlyStatsResponse> stats = dashboardService.getMonthlyStats();
			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch monthly stats: " + e.getMessage()));
		}
	}

	@GetMapping("/dashboard/pet-status")
	public ResponseEntity<?> getPetStatus(@RequestHeader("Authorization") String token) {
		if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
			return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
		}
		try {
			List<PetStatusResponse> status = dashboardService.getPetStatus();
			return ResponseEntity.ok(status);
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(new AuthController.ErrorResponse("Failed to fetch pet status: " + e.getMessage()));
		}
	}

	@GetMapping("/dashboard/recent-activities")
	public ResponseEntity<?> getRecentActivities(@RequestHeader("Authorization") String token,
	        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
	    if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.SUPERADMIN)) {
	        return ResponseEntity.status(403).body(new AuthController.ErrorResponse("User must have SUPERADMIN role"));
	    }
	    try {
	        Pageable pageable = PageRequest.of(page, size); // Zero-based page
	        Page<RecentActivityResponse> activitiesPage = dashboardService.getRecentActivities(pageable);
	        return ResponseEntity.ok(activitiesPage); // Returns Page object with content, total pages, etc.
	    } catch (Exception e) {
	        return ResponseEntity.status(500)
	                .body(new AuthController.ErrorResponse("Failed to fetch recent activities: " + e.getMessage()));
	    }
	}

	private AdminProfileResponse mapToAdminProfileResponse(PetCenter petCenter) {
		AdminProfileResponse response = new AdminProfileResponse();
		response.setId(petCenter.getId());
		response.setShelterName(petCenter.getShelterName());
		response.setAddress(petCenter.getAddress());
		response.setPhone(petCenter.getPhone());
		response.setDescription(petCenter.getDescription());
		response.setEmail(petCenter.getEmail());
		return response;
	}

	private PetResponse mapToPetResponse(Pet pet) {
		PetResponse response = new PetResponse();
		response.setId(pet.getId());
		response.setName(pet.getName());
		response.setBreed(pet.getBreed());
		response.setAge(pet.getAge());
		response.setGender(pet.getGender());
		response.setDescription(pet.getDescription());
		response.setLocation(pet.getLocation());
		response.setStatus(pet.getStatus());
		response.setCenterId(pet.getCenterId());
		return response;
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