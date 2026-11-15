@echo off
REM Build React app and copy to Spring Boot static resources

echo Building React app...
call npm run build:prod

echo Creating Spring Boot static resources directory...
if not exist "src\main\resources\static" mkdir "src\main\resources\static"

echo Copying built files to Spring Boot static resources...
xcopy /E /I /Y dist\* src\main\resources\static\

echo Build complete! React app is now integrated with Spring Boot.
echo Run 'mvn spring-boot:run' to start the Spring Boot application.