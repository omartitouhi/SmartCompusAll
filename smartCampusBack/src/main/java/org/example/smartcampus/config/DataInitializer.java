package org.example.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.entity.Filiere;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.entity.User;
import org.example.smartcampus.enums.Role;
import org.example.smartcampus.repository.FiliereRepository;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final FiliereRepository filiereRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Seed admin user
            if (userRepository.findByEmail("admin@smartcampus.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@smartcampus.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("✓ Admin user created: admin@smartcampus.com / admin123");
            }

            // Seed student filieres
            seedFiliere("Génie Logiciel et Systèmes d'Information",
                    "Conception et développement de logiciels, bases de données et systèmes d'information");
            seedFiliere("Cybersécurité et Réseaux",
                    "Sécurité des systèmes informatiques, réseaux et protection des données");
            seedFiliere("Intelligence Artificielle",
                    "Machine learning, deep learning, traitement du langage naturel et vision par ordinateur");

            // Seed teacher subjects
            seedSubject("Mathématiques", "Algèbre, analyse et mathématiques discrètes");
            seedSubject("Physique", "Mécanique, électromagnétisme et thermodynamique");
            seedSubject("Informatique", "Algorithmique, structures de données et programmation");
            seedSubject("Chimie", "Chimie générale, organique et analytique");
            seedSubject("Anglais", "Langue anglaise et communication professionnelle");
            seedSubject("Réseaux", "Architecture des réseaux, protocoles et administration");
            seedSubject("Base de Données", "Conception, modélisation et administration de bases de données");
        };
    }

    private void seedFiliere(String name, String description) {
        if (!filiereRepository.existsByName(name)) {
            Filiere f = new Filiere();
            f.setName(name);
            f.setDescription(description);
            filiereRepository.save(f);
            System.out.println("✓ Filiere created: " + name);
        }
    }

    private void seedSubject(String name, String description) {
        if (!subjectRepository.existsByName(name)) {
            Subject s = new Subject();
            s.setName(name);
            s.setDescription(description);
            subjectRepository.save(s);
            System.out.println("✓ Subject created: " + name);
        }
    }
}
