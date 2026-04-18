package org.example.smartcampus.service;

import org.example.smartcampus.dto.SubjectRequest;
import org.example.smartcampus.dto.SubjectResponse;
import java.util.List;

public interface ISubjectService {
    SubjectResponse createSubject(SubjectRequest request);
    List<SubjectResponse> getAllSubjects();
    SubjectResponse getSubjectById(Long id);
    SubjectResponse updateSubject(Long id, SubjectRequest request);
    void deleteSubject(Long id);
}
