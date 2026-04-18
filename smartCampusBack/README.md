# Smart Campus Backend API

## 📋 Table des matières

- [Description](#description)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Sécurité](#sécurité)

## 📖 Description

Smart Campus est une application web complète de gestion de campus universitaire. Ce dépôt contient le **backend API** construit avec Spring Boot et PostgreSQL.

### Fonctionnalités

- ✅ **Authentification sécurisée** - Login avec email/mot de passe
- ✅ **Gestion des utilisateurs** - CRUD pour administrateurs
- ✅ **Rôles** - ADMIN, TEACHER, STUDENT
- ✅ **Validation des données** - Entrées validées automatiquement
- ✅ **Gestion des erreurs** - Réponses cohérentes
- ✅ **Architecture propre** - Séparation des couches

## 🔧 Prérequis

- **Java 17+** - [Télécharger](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- **Maven 3.6+** - [Télécharger](https://maven.apache.org/download.cgi)
- **PostgreSQL 12+** - [Télécharger](https://www.postgresql.org/download/)
- **Git** (optionnel) - Pour cloner le projet

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone <repository-url>
cd smartCampus
```

### 2. Créer la base de données PostgreSQL

```bash
# Ouvrir psql
psql -U postgres

# Ou directement avec la commande:
createdb smart_campus
```

### 3. Compiler les dépendances

```bash
mvn clean install
```

### 4. Démarrer l'application

```bash
mvn spring-boot:run
```

L'application démarre sur `http://localhost:8080`

## ⚙️ Configuration

### Configuration de base de données

Éditer `src/main/resources/application.properties`:

```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe
```

### Configuration Hibernate

```properties
# Options disponibles:
spring.jpa.hibernate.ddl-auto=create-drop  # Recrée à chaque démarrage
spring.jpa.hibernate.ddl-auto=create       # Crée si n'existe pas
spring.jpa.hibernate.ddl-auto=update       # Met à jour le schéma
spring.jpa.hibernate.ddl-auto=validate     # Valide uniquement
```

## 🚀 Utilisation

### Démarrage avec données exemple

À la première exécution, trois utilisateurs par défaut sont créés:

```
Admin:    admin@smartcampus.com / admin123
Teacher:  teacher@smartcampus.com / teacher123
Student:  student@smartcampus.com / student123
```

### Test avec cURL

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartcampus.com","password":"admin123"}'
```

#### Créer un utilisateur
```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@smartcampus.com",
    "password":"password123",
    "role":"TEACHER"
  }'
```

### Utiliser Postman

Importez `Smart_Campus_API.postman_collection.json` dans Postman pour tester tous les endpoints.

## 📡 API Endpoints

### Authentification

#### POST /api/auth/login
```
Connexion utilisateur avec email et mot de passe
Retourne: id, email, role, message
```

### Administration (Admin uniquement)

#### POST /api/admin/users
```
Créer un nouvel utilisateur (TEACHER ou STUDENT)
Corps: email, password, role
Retourne: id, email, role, createdAt, updatedAt
```

#### GET /api/admin/users
```
Récupérer tous les utilisateurs
Retourne: Array[UserResponse]
```

## 🏗️ Architecture

### Structure des dossiers

```
org/example/smartcampus/
├── config/              # Configuration Spring
│   ├── SecurityConfig.java
│   └── DataInitializer.java
├── controller/          # REST Endpoints
│   ├── AuthController.java
│   └── AdminController.java
├── service/             # Logique métier
│   ├── AuthService.java
│   └── AdminService.java
├── repository/          # Accès aux données
│   └── UserRepository.java
├── entity/              # Modèles JPA
│   └── User.java
├── dto/                 # Objets de transfert
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── CreateUserRequest.java
│   ├── UserResponse.java
│   └── ErrorResponse.java
├── enums/               # Énumérations
│   └── Role.java
└── exception/           # Gestion des erreurs
    ├── ResourceNotFoundException.java
    ├── UserAlreadyExistsException.java
    ├── UnauthorizedException.java
    └── GlobalExceptionHandler.java
```

### Flux de requête

```
Client → Controller → Service → Repository → Database
         ↑       ↓
      Validation/Erreurs
```

## 🔐 Sécurité

### Encodage des mots de passe
- Utilise BCrypt
- Chaque mot de passe est salé et haché
- Les mots de passe en clair ne sont jamais stockés

### Validation des données
- Email valide requis
- Mot de passe minimum 6 caractères
- Email unique en base de données
- Validation côté serveur obligatoire

### Gestion des erreurs
- Erreurs globales avec `@RestControllerAdvice`
- Codes HTTP appropriés
- Messages d'erreur descriptifs

## 📚 Documentation

- **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Guide détaillé en anglais
- **[STARTUP_GUIDE_FR.md](STARTUP_GUIDE_FR.md)** - Guide détaillé en français
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Vue d'ensemble du projet

## 🐛 Dépannage

### PostgreSQL ne se connecte pas
```bash
# Vérifier que PostgreSQL est en cours d'exécution
# Windows: Services → postgresql

# Vérifier les identifiants
psql -U postgres -h localhost
```

### Erreur "user not found"
- Vérifiez que l'utilisateur existe
- Vérifiez l'orthographe de l'email (case-sensitive)

### Erreur "invalid password"
- Vérifiez que le mot de passe est correct
- Les mots de passe sont sensibles à la casse

### Port 8080 déjà utilisé
```bash
# Changer le port dans application.properties
server.port=8081
```

## 📦 Dépendances principales

```xml
<!-- Spring Boot -->
<spring-boot-starter-web>
<spring-boot-starter-data-jpa>
<spring-boot-starter-security>
<spring-boot-starter-validation>

<!-- Database -->
<postgresql>

<!-- Utilities -->
<lombok>
```

## 🔄 Prochaines étapes

- [ ] Implémenter JWT tokens
- [ ] Ajouter OAuth2
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Swagger/OpenAPI
- [ ] Audit logging
- [ ] 2FA (Two-Factor Authentication)

## 👨‍💻 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commiter (`git commit -m 'Add amazing feature'`)
4. Pousser (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question:
- 📧 Ouvrir une issue GitHub
- 💬 Contacter l'équipe de développement

---

**Version**: 0.0.1  
**Java**: 17  
**Spring Boot**: 4.0.3  
**PostgreSQL**: 12+  

Bon développement ! 🎓✨

