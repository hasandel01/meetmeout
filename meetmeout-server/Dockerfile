FROM openjdk:23
EXPOSE 8080
COPY target/meetmeout-server-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["sh", "-c", "echo 💥 PORT VALUE: ${PORT:-8080} && java -Dserver.port=${PORT:-8080} -jar /app.jar"]
