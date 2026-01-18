package com.PrescribeCorrect.app.repository;

import com.PrescribeCorrect.app.model.PrescriptionAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionAnalysisRepository extends JpaRepository<PrescriptionAnalysis, Long> {
    List<PrescriptionAnalysis> findByUser_EmailOrderByAnalysisDateDesc(String userEmail);
}
