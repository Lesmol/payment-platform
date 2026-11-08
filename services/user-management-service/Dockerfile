# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY domain-contracts domain-contracts
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f domain-contracts install -DskipTests
COPY user-management-service/pom.xml user-management-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f user-management-service dependency:go-offline
COPY user-management-service user-management-service
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f user-management-service package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/user-management-service/target/user-management-service.jar app.jar
USER app
EXPOSE 8082 9082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
