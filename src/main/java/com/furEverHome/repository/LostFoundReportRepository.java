package com.furEverHome.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.furEverHome.entity.LostFoundReport;

public interface LostFoundReportRepository extends JpaRepository<LostFoundReport, UUID> {
}