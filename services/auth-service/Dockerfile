# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY domain-contracts domain-contracts
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f domain-contracts install -DskipTests
COPY auth-service/pom.xml auth-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f auth-service dependency:go-offline
COPY auth-service auth-service
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f auth-service package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/auth-service/target/auth-service.jar app.jar
USER app
EXPOSE 8081 9081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
