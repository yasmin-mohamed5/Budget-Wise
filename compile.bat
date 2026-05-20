@echo off
set JAVA_HOME=%~dp0java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64
echo Compiling Project using local JDK...
if not exist bin mkdir bin
"%JAVA_HOME%\bin\javac.exe" -d bin src\main\java\com\*.java
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b %errorlevel%
)
echo Compilation successful.
