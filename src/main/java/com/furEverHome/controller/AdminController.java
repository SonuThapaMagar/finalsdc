package com.furEverHome.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.furEverHome.dto.AdminProfileResponse;
import com.furEverHome.dto.AdminProfileUpdateRequest;
import com.furEverHome.dto.AdoptionRequestResponse;
import com.furEverHome.dto.AdoptionRequestStatusUpdate;
import com.furEverHome.dto.UserResponse;
import com.furEverHome.entity.Role;
import com.furEverHome.entity.User;
import com.furEverHome.repository.UserRepository;
import com.furEverHome.service.AdoptionRequestService;
import com.furEverHome.service.PetCenterService;
import com.furEverHome.util.JwtUtil;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final JwtUtil jwtUtil;
    private final AdoptionRequestService adoptionRequestService;
    private final PetCenterService petCenterService;
    private final UserRepository userRepository;

    @Autowired
    public AdminController(JwtUtil jwtUtil, AdoptionRequestService adoptionRequestService,
                           PetCenterService petCenterService, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.adoptionRequestService = adoptionRequestService;
        this.petCenterService = petCenterService;
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        String tokenValue = token.substring(7); // Remove "Bearer " prefix
        try {
            if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.ADMIN)) {
                return ResponseEntity.status(403)
                        .body(new AuthController.ErrorResponse("User must have ADMIN role to view users"));
            }
            List<User> users = userRepository.findAll();
            List<UserResponse> userResponses = users.stream()
                    .map(user -> new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                            user.getPhone(), user.getAddress(), user.getRole().name()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            System.err.println("Error fetching users: " + e.getMessage());
            return ResponseEntity.status(403)
                    .body(new AuthController.ErrorResponse("Invalid token or access denied: " + e.getMessage()));
        }
    }

    @GetMapping("/adoption-requests")
    public ResponseEntity<?> getAllAdoptionRequests(@RequestHeader("Authorization") String token) {
        String tokenValue = token.substring(7);
        if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.ADMIN)) {
            return ResponseEntity.status(403)
                    .body(new AuthController.ErrorResponse("User must have ADMIN role to view adoption requests"));
        }
        List<AdoptionRequestResponse> requests = adoptionRequestService.getAllAdoptionRequests();
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/adoption-request/{id}/status")
    public ResponseEntity<?> updateAdoptionRequestStatus(@RequestHeader("Authorization") String token,
                                                        @PathVariable UUID id, @RequestBody AdoptionRequestStatusUpdate updateDTO) {
        String tokenValue = token.substring(7);
        System.out.println("Controller received token: " + tokenValue);
        try {
            Role role = jwtUtil.getRoleFromToken(tokenValue);
            System.out.println("Extracted role from token: " + role);
            if (role == null) {
                System.out.println("Role is null");
                return ResponseEntity.status(403)
                        .body(new AuthController.ErrorResponse("Role is null, ADMIN role required"));
            }
            if (!role.equals(Role.ADMIN)) {
                System.out.println("Role check failed: " + role + " is not ADMIN");
                return ResponseEntity.status(403).body(
                        new AuthController.ErrorResponse("User must have ADMIN role to update adoption requests"));
            }
            try {
                AdoptionRequestResponse responseDTO = adoptionRequestService.updateAdoptionRequestStatus(id, updateDTO);
                return ResponseEntity
                        .ok(new SuccessResponse("Adoption request status updated successfully", responseDTO));
            } catch (IllegalArgumentException | IllegalStateException e) {
                return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity.status(500)
                        .body(new AuthController.ErrorResponse("Failed to update adoption request: " + e.getMessage()));
            }
        } catch (Exception e) {
            System.out.println("Exception while extracting role: " + e.getMessage());
            return ResponseEntity.status(403)
                    .body(new AuthController.ErrorResponse("Invalid token: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile(@RequestHeader("Authorization") String token) {
        try {
            String tokenValue = token.substring(7); // Remove "Bearer " prefix
            if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.ADMIN)) {
                return ResponseEntity.status(403)
                        .body(new AuthController.ErrorResponse("User must have ADMIN role to view profile"));
            }
            String email = jwtUtil.getEmailFromToken(tokenValue);
            System.out.println("Fetching profile for email: " + email); // Debug
            AdminProfileResponse profile = petCenterService.getAdminProfileByEmail(email);
            return ResponseEntity.ok(new SuccessResponse("Admin profile retrieved successfully", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(new AuthController.ErrorResponse("Profile not found: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            return ResponseEntity.status(403)
                    .body(new AuthController.ErrorResponse("Invalid token or access denied: " + e.getMessage()));
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestHeader("Authorization") String token,
                                               @RequestBody AdminProfileUpdateRequest updateRequest) {
        String tokenValue = token.substring(7);
        if (!jwtUtil.getRoleFromToken(tokenValue).equals(Role.ADMIN)) {
            return ResponseEntity.status(403)
                    .body(new AuthController.ErrorResponse("User must have ADMIN role to update profile"));
        }
        try {
            String email = jwtUtil.getEmailFromToken(tokenValue);
            AdminProfileResponse updatedProfile = petCenterService.updatePetCenterProfile(email, updateRequest);
            return ResponseEntity.ok(new SuccessResponse("Admin profile updated successfully", updatedProfile));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new AuthController.ErrorResponse("Failed to update admin profile: " + e.getMessage()));
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