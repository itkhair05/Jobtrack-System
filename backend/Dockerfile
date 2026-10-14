# Stage 1: Build the JAR with Maven
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /build

# Copy Maven wrapper and configuration
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Cache dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package the artifact
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Production runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create a non-root application user and persistent upload directory
RUN useradd -u 1001 -m -s /bin/sh appuser && \
    mkdir -p /var/lib/jobtrack/uploads/cvs && \
    chown -R appuser:appuser /app /var/lib/jobtrack

# Copy the built jar from the builder stage
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]