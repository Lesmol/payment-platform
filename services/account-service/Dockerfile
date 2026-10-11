# syntax=docker/dockerfile:1
FROM maven:3.10.0-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/target/account-service.jar app.jar
USER app
EXPOSE 8083 9083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
