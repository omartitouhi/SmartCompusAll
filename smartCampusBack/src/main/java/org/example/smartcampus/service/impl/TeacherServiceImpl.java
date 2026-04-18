package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.SubjectResponse;
import org.example.smartcampus.dto.TeacherRequest;
import org.example.smartcampus.dto.TeacherResponse;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.entity.Teacher;
import org.example.smartcampus.entity.User;
import org.example.smartcampus.enums.Role;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UserAlreadyExistsException;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.repository.TeacherRepository;
import org.example.smartcampus.repository.UserRepository;
import org.example.smartcampus.service.ITeacherService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements ITeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public TeacherResponse createTeacher(TeacherRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(
                    "User already exists with email: " + request.getEmail()
            );
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.TEACHER);
        User savedUser = userRepository.save(user);

        // Create teacher
        Teacher teacher = new Teacher();
        teacher.setUser(savedUser);
        teacher.setDepartment(request.getDepartment());
        teacher.setSubjects(resolveSubjects(request.getSubjectNames()));

        Teacher savedTeacher = teacherRepository.save(teacher);
        return convertToResponse(savedTeacher);
    }

    @Override
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found with id: " + id
                ));
        return convertToResponse(teacher);
    }

    @Override
    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found with id: " + id
                ));

        User user = teacher.getUser();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(user);

        teacher.setDepartment(request.getDepartment());
        teacher.setSubjects(resolveSubjects(request.getSubjectNames()));

        Teacher updatedTeacher = teacherRepository.save(teacher);
        return convertToResponse(updatedTeacher);
    }

    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found with id: " + id
                ));

        teacherRepository.deleteById(id);
        userRepository.deleteById(teacher.getUser().getId());
    }

    private List<Subject> resolveSubjects(List<String> subjectNames) {
        if (subjectNames == null || subjectNames.isEmpty()) {
            return new ArrayList<>();
        }
        return subjectNames.stream()
                .map(name -> subjectRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Subject not found with name: " + name
                        )))
                .collect(Collectors.toList());
    }

    private TeacherResponse convertToResponse(Teacher teacher) {
        User user = teacher.getUser();

        List<SubjectResponse> subjects = teacher.getSubjects() == null
                ? new ArrayList<>()
                : teacher.getSubjects().stream()
                        .map(s -> new SubjectResponse(s.getId(), s.getName(), s.getDescription(), s.getCreatedAt()))
                        .collect(Collectors.toList());

        return new TeacherResponse(
                teacher.getId(),
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                teacher.getDepartment(),
                subjects
        );
    }
}
