# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY domain-contracts domain-contracts
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f domain-contracts install -DskipTests
COPY notification-service/pom.xml notification-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f notification-service dependency:go-offline
COPY notification-service notification-service
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f notification-service package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/notification-service/target/notification-service.jar app.jar
USER app
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
