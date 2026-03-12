FROM maven:3.9.9-eclipse-temurin-8 AS builder

WORKDIR /build

COPY .mvn .mvn
COPY mvnw mvnw
COPY api-common api-common
COPY api-client-sdk api-client-sdk
COPY api-gateway api-gateway

RUN chmod +x mvnw \
  && ./mvnw -q -f api-common/pom.xml -DskipTests clean install \
  && ./mvnw -q -f api-client-sdk/pom.xml -DskipTests clean install \
  && ./mvnw -q -f api-gateway/pom.xml -DskipTests clean package

FROM eclipse-temurin:8-jre

WORKDIR /app

COPY --from=builder /build/api-gateway/target/*.jar /app/app.jar

EXPOSE 8090

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar"]
