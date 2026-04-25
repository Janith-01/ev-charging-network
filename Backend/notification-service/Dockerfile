FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=builder /app/target/*.jar app.jar

USER spring
ENV JAVA_OPTS=""

EXPOSE 8085
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
