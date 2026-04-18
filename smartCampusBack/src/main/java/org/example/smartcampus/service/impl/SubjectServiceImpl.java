package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.SubjectRequest;
import org.example.smartcampus.dto.SubjectResponse;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UserAlreadyExistsException;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.service.ISubjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements ISubjectService {

    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        if (subjectRepository.existsByName(request.getName())) {
            throw new UserAlreadyExistsException("Une matière existe déjà avec le nom: " + request.getName());
        }
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        return toResponse(subjectRepository.save(subject));
    }

    @Override
    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public SubjectResponse getSubjectById(Long id) {
        return toResponse(subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id)));
    }

    @Override
    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id));
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        return toResponse(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Matière non trouvée avec l'id: " + id);
        }
        subjectRepository.deleteById(id);
    }

    private SubjectResponse toResponse(Subject s) {
        return new SubjectResponse(s.getId(), s.getName(), s.getDescription(), s.getCreatedAt());
    }
}
