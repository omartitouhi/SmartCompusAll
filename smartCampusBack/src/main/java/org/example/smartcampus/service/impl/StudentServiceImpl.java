package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.StudentRequest;
import org.example.smartcampus.dto.StudentResponse;
import org.example.smartcampus.entity.Filiere;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.entity.User;
import org.example.smartcampus.enums.Level;
import org.example.smartcampus.enums.Role;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UserAlreadyExistsException;
import org.example.smartcampus.repository.FiliereRepository;
import org.example.smartcampus.repository.SchoolClassRepository;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.repository.UserRepository;
import org.example.smartcampus.service.IStudentService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements IStudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FiliereRepository filiereRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        // Validate that password is provided for creation
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required for student creation");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(
                    "User already exists with email: " + request.getEmail()
            );
        }

        // Check if CIN already exists
        if (studentRepository.existsByCin(request.getCin())) {
            throw new UserAlreadyExistsException(
                    "Student already exists with CIN: " + request.getCin()
            );
        }

        // Get filiere by name
        Filiere filiere = filiereRepository.findByName(request.getFiliereName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Filiere not found with name: " + request.getFiliereName()
                ));

        // Find or create appropriate class
        SchoolClass schoolClass = findOrCreateClass(filiere, request.getLevel());

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.STUDENT);
        User savedUser = userRepository.save(user);

        // Create student
        Student student = new Student();
        student.setUser(savedUser);
        student.setSchoolYear(request.getSchoolYear());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setCin(request.getCin());
        student.setLevel(request.getLevel());
        student.setSchoolClass(schoolClass);

        Student savedStudent = studentRepository.save(student);

        // Update class size
        schoolClass.setCurrentSize(schoolClass.getCurrentSize() + 1);
        schoolClassRepository.save(schoolClass);

        return convertToResponse(savedStudent);
    }

    private SchoolClass findOrCreateClass(Filiere filiere, Level level) {
        // Get all classes for this filiere and level, ordered by class name
        List<SchoolClass> classes = schoolClassRepository
                .findByFiliereAndLevelOrderByClassNameAsc(filiere, level);

        // Find first class that is not full
        for (SchoolClass schoolClass : classes) {
            if (!schoolClass.isFull()) {
                return schoolClass;
            }
        }

        // All classes are full or no classes exist, create a new one
        String newClassName = getNextClassName(classes);
        SchoolClass newClass = new SchoolClass();
        newClass.setClassName(newClassName);
        newClass.setFiliere(filiere);
        newClass.setLevel(level);
        newClass.setCapacity(15);
        newClass.setCurrentSize(0);

        return schoolClassRepository.save(newClass);
    }

    private String getNextClassName(List<SchoolClass> existingClasses) {
        if (existingClasses.isEmpty()) {
            return "A";
        }

        // Get the last class name and increment it
        String lastClassName = existingClasses.get(existingClasses.size() - 1).getClassName();
        char nextChar = (char) (lastClassName.charAt(0) + 1);
        return String.valueOf(nextChar);
    }

    @Override
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + id
                ));
        return convertToResponse(student);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + id
                ));

        User user = student.getUser();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(user);

        // Get filiere by name
        Filiere filiere = filiereRepository.findByName(request.getFiliereName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Filiere not found with name: " + request.getFiliereName()
                ));

        // If filiere or level changed, find or create new class
        SchoolClass currentClass = student.getSchoolClass();
        if (!currentClass.getFiliere().getName().equals(request.getFiliereName())
            || !currentClass.getLevel().equals(request.getLevel())) {

            // Decrease current class size
            currentClass.setCurrentSize(Math.max(0, currentClass.getCurrentSize() - 1));
            schoolClassRepository.save(currentClass);

            // Find or create new class
            SchoolClass newClass = findOrCreateClass(filiere, request.getLevel());
            newClass.setCurrentSize(newClass.getCurrentSize() + 1);
            schoolClassRepository.save(newClass);

            student.setSchoolClass(newClass);
        }

        student.setSchoolYear(request.getSchoolYear());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setCin(request.getCin());
        student.setLevel(request.getLevel());

        Student updatedStudent = studentRepository.save(student);
        return convertToResponse(updatedStudent);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + id
                ));

        SchoolClass schoolClass = student.getSchoolClass();
        schoolClass.setCurrentSize(Math.max(0, schoolClass.getCurrentSize() - 1));
        schoolClassRepository.save(schoolClass);

        studentRepository.deleteById(id);
        userRepository.deleteById(student.getUser().getId());
    }

    @Override
    public List<StudentResponse> getStudentsByClass(Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Class not found with id: " + classId
                ));

        return studentRepository.findBySchoolClass(schoolClass)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentResponse> searchStudents(
            String email,
            String firstName,
            String lastName,
            String cin,
            String schoolYear,
            Level level,
            String className,
            String filiereName
    ) {
        return studentRepository.searchStudents(
                email, firstName, lastName, cin,
                schoolYear, level, className, filiereName
        ).stream()
         .map(this::convertToResponse)
         .collect(Collectors.toList());
    }

    private StudentResponse convertToResponse(Student student) {
        User user = student.getUser();
        SchoolClass schoolClass = student.getSchoolClass();

        return new StudentResponse(
                student.getId(),
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                student.getSchoolYear(),
                student.getDateOfBirth(),
                student.getCin(),
                student.getLevel(),
                schoolClass.getFullClassName(),
                schoolClass.getFiliere().getName()
        );
    }
}
