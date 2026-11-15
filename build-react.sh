#!/bin/bash

# Build React app and copy to Spring Boot static resources
echo "Building React app..."
npm run build:prod

echo "Creating Spring Boot static resources directory..."
mkdir -p src/main/resources/static

echo "Copying built files to Spring Boot static resources..."
cp -r dist/* src/main/resources/static/

echo "Build complete! React app is now integrated with Spring Boot."
echo "Run 'mvn spring-boot:run' to start the Spring Boot application."