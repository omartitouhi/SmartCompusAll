# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=builder /app/target/smartCampus-0.0.1-SNAPSHOT.jar smartCampus.jar

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "smartCampus.jar"]
