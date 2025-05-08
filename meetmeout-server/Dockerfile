FROM openjdk:23

# Uygulama JAR dosyasını kapsayıcıya kopyala
COPY out/artifacts/meetmeout_server_jar/meetmeout-server.jar app.jar

# Uygulamanın çalıştırılması
ENTRYPOINT ["java", "-jar", "/app.jar"]
