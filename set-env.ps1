# VoltGrid Backend Launcher
# Run this script in ANY new PowerShell terminal to load Java + Maven into PATH

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:MAVEN_HOME = "C:\maven\apache-maven-3.9.14"
$env:Path = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;" + $env:Path

Write-Host "✅ Java and Maven loaded into PATH for this session." -ForegroundColor Green
java -version
& "$env:MAVEN_HOME\bin\mvn.cmd" -version
