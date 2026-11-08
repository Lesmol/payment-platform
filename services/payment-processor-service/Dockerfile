# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY domain-contracts domain-contracts
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f domain-contracts install -DskipTests
COPY payment-processor-service/pom.xml payment-processor-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f payment-processor-service dependency:go-offline
COPY payment-processor-service payment-processor-service
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f payment-processor-service package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/payment-processor-service/target/payment-processor-service.jar app.jar
USER app
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
