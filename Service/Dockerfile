# Generic Dockerfile for any module in this Maven reactor.
# Build with: docker build --build-arg SERVICE_NAME=patient-service -t myimage .
# Must be built with context = Service/ (the reactor root), so it can see every module's target/ folder.
 
FROM eclipse-temurin:17-jre-alpine
 
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}
 
WORKDIR /app
 
# Copies the jar from the specific module's target/ folder, e.g. patient-service/target/*.jar
COPY ${SERVICE_NAME}/target/*.jar app.jar
 
# Adjust per-service if ports differ (check each module's application.properties/yml)
EXPOSE 8080
 
ENTRYPOINT ["java", "-jar", "app.jar"]
