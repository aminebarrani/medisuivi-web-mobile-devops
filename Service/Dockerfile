# ─── Single Unified Dockerfile for all MediSuivi Backend Microservices ────────
# Usage:
#   docker build --build-arg SERVICE_NAME=<module-name> -t <image-name> -f Dockerfile .
#
# Supported modules: config-server, discovery, gateway, user-service, patient-service
#
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# The service module name passed during docker build (e.g. user-service)
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# Copy the built jar of the specified microservice module
COPY ${SERVICE_NAME}/target/*.jar app.jar

# Expose all backend ports used across services
# 8761: discovery, 8888: config-server, 8222: gateway, 8081: user-service, 8082: patient-service
EXPOSE 8080 8081 8082 8222 8761 8888

ENTRYPOINT ["java", "-jar", "app.jar"]
