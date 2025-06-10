FROM openjdk:23
EXPOSE 8080
COPY target/meetmeout-server-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["sh", "-c", "echo 💥 PORT VALUE: $PORT && java -Dserver.port=$PORT -jar /app.jar --spring.profiles.active=prod"]
