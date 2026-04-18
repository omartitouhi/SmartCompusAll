package org.example.smartcampus.service;

import org.example.smartcampus.dto.FiliereRequest;
import org.example.smartcampus.dto.FiliereResponse;
import java.util.List;

public interface IFiliereService {
    FiliereResponse createFiliere(FiliereRequest request);
    List<FiliereResponse> getAllFilieres();
    FiliereResponse getFiliereById(Long id);
    FiliereResponse updateFiliere(Long id, FiliereRequest request);
    void deleteFiliere(Long id);
}
