package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.FiliereRequest;
import org.example.smartcampus.dto.FiliereResponse;
import org.example.smartcampus.entity.Filiere;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UserAlreadyExistsException;
import org.example.smartcampus.repository.FiliereRepository;
import org.example.smartcampus.service.IFiliereService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FiliereServiceImpl implements IFiliereService {

    private final FiliereRepository filiereRepository;

    @Override
    @Transactional
    public FiliereResponse createFiliere(FiliereRequest request) {
        if (filiereRepository.existsByName(request.getName())) {
            throw new UserAlreadyExistsException("Une filière existe déjà avec le nom: " + request.getName());
        }
        Filiere filiere = new Filiere();
        filiere.setName(request.getName());
        filiere.setDescription(request.getDescription());
        return toResponse(filiereRepository.save(filiere));
    }

    @Override
    public List<FiliereResponse> getAllFilieres() {
        return filiereRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public FiliereResponse getFiliereById(Long id) {
        return toResponse(filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filière non trouvée avec l'id: " + id)));
    }

    @Override
    @Transactional
    public FiliereResponse updateFiliere(Long id, FiliereRequest request) {
        Filiere filiere = filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filière non trouvée avec l'id: " + id));
        filiere.setName(request.getName());
        filiere.setDescription(request.getDescription());
        return toResponse(filiereRepository.save(filiere));
    }

    @Override
    @Transactional
    public void deleteFiliere(Long id) {
        if (!filiereRepository.existsById(id)) {
            throw new ResourceNotFoundException("Filière non trouvée avec l'id: " + id);
        }
        filiereRepository.deleteById(id);
    }

    private FiliereResponse toResponse(Filiere f) {
        return new FiliereResponse(f.getId(), f.getName(), f.getDescription(), f.getCreatedAt());
    }
}
