FROM maven:3.9.9-eclipse-temurin-8 AS builder

WORKDIR /build

COPY .mvn .mvn
COPY mvnw mvnw
COPY api-client-sdk api-client-sdk
COPY api-interface api-interface

RUN chmod +x mvnw \
  && ./mvnw -q -f api-client-sdk/pom.xml -DskipTests clean install \
  && ./mvnw -q -f api-interface/pom.xml -DskipTests clean package

FROM eclipse-temurin:8-jre

WORKDIR /app

COPY --from=builder /build/api-interface/target/*.jar /app/app.jar

EXPOSE 8123

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar"]
