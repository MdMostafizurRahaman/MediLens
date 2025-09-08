package com.medilens.app.service;

import com.medilens.app.dto.PrescriptionAnalysisDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.PrescriptionAnalysis;

import java.util.List;

public interface PrescriptionAnalysisService {
    PrescriptionAnalysisDTO saveAnalysis(PrescriptionAnalysis analysis, String userEmail) throws NotFoundException;
    List<PrescriptionAnalysisDTO> getUserAnalyses(String userEmail) throws NotFoundException;
    PrescriptionAnalysisDTO getAnalysisById(Long id) throws NotFoundException;
    PrescriptionAnalysisDTO sendAnalysisToChat(Long analysisId, String userEmail) throws NotFoundException;
}
