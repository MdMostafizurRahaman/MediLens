# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy Maven build files
COPY . .

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose the port
EXPOSE 8080

# Run the jar file with Render's PORT variable
CMD ["java", "-Dserver.port=${PORT:8080}", "-jar", "target/app-0.0.1-SNAPSHOT.jar"]