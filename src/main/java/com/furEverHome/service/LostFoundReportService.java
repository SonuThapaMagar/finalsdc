// com.furEverHome.service.LostFoundReportService.java
package com.furEverHome.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.furEverHome.dto.LostFoundReportDTO;
import com.furEverHome.entity.LostFoundReport;
import com.furEverHome.entity.Role;
import com.furEverHome.entity.User;
import com.furEverHome.repository.LostFoundReportRepository;
import com.furEverHome.repository.UserRepository;
import com.furEverHome.util.JwtUtil;

@Service
public class LostFoundReportService {

    private final LostFoundReportRepository lostFoundReportRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final JwtUtil jwtUtil;

    @Autowired
    public LostFoundReportService(LostFoundReportRepository lostFoundReportRepository,
            UserRepository userRepository, FileStorageService fileStorageService, JwtUtil jwtUtil) {
        this.lostFoundReportRepository = lostFoundReportRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.jwtUtil = jwtUtil;
    }

    public LostFoundReport submitLostFoundReport(String token, LostFoundReportDTO reportDTO) throws IOException {
        String email = jwtUtil.getEmailFromToken(token.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (!jwtUtil.getRoleFromToken(token.substring(7)).equals(Role.USER)) {
            throw new IllegalStateException("User must have USER role to submit a lost/found report");
        }

        String imageUrl = null;
        if (reportDTO.getImage() != null && !reportDTO.getImage().isEmpty()) {
            imageUrl = fileStorageService.storeFile(reportDTO.getImage(), user.getId().toString(), "lostfound");
        }

        LostFoundReport report = new LostFoundReport(
            imageUrl,
            reportDTO.getLocation(),
            reportDTO.getDescription(),
            reportDTO.getPetCenterId(),
            user
        );

        return lostFoundReportRepository.save(report);
    }
}