package com.medilens.app.repository;

import com.medilens.app.model.PrescriptionAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionAnalysisRepository extends JpaRepository<PrescriptionAnalysis, Long> {
    List<PrescriptionAnalysis> findByUser_EmailOrderByAnalysisDateDesc(String userEmail);
}
