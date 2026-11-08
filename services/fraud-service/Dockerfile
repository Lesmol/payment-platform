# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY domain-contracts domain-contracts
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f domain-contracts install -DskipTests
COPY fraud-service/pom.xml fraud-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f fraud-service dependency:go-offline
COPY fraud-service fraud-service
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f fraud-service package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/fraud-service/target/fraud-service.jar app.jar
USER app
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
