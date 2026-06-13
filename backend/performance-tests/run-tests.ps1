param(
    [string]$Type = "Smoke"
)

# Clear old results
if (Test-Path -Path "performance-tests/results.csv") { Remove-Item -Path "performance-tests/results.csv" -Force }
if (Test-Path -Path "performance-tests/html-report") { Remove-Item -Path "performance-tests/html-report" -Recurse -Force }

switch ($Type) {
    "Smoke" {
        Write-Host "Running Smoke Test (10 Users, 5 Iterations)..."
        java -jar apache-jmeter-5.6.3\bin\ApacheJMeter.jar -n -t performance-tests/MasterPerformanceSuite.jmx -l performance-tests/results.csv -e -o performance-tests/html-report -Jusers=10 -Jrampup=5 -Jloops=5
    }
    "Load" {
        Write-Host "Running Load Test (100 Users)..."
        java -jar apache-jmeter-5.6.3\bin\ApacheJMeter.jar -n -t performance-tests/MasterPerformanceSuite.jmx -l performance-tests/results.csv -e -o performance-tests/html-report -Jusers=100 -Jrampup=30 -Jloops=10
    }
    "Stress" {
        Write-Host "Running Stress Test (500 Users)..."
        java -jar apache-jmeter-5.6.3\bin\ApacheJMeter.jar -n -t performance-tests/MasterPerformanceSuite.jmx -l performance-tests/results.csv -e -o performance-tests/html-report -Jusers=500 -Jrampup=60 -Jloops=20
    }
    "Spike" {
        Write-Host "Running Spike Test (500 Users Instantly)..."
        java -jar apache-jmeter-5.6.3\bin\ApacheJMeter.jar -n -t performance-tests/MasterPerformanceSuite.jmx -l performance-tests/results.csv -e -o performance-tests/html-report -Jusers=500 -Jrampup=1 -Jloops=10
    }
    "Endurance" {
        Write-Host "Running Endurance Test (50 Users endlessly)..."
        java -jar apache-jmeter-5.6.3\bin\ApacheJMeter.jar -n -t performance-tests/MasterPerformanceSuite.jmx -l performance-tests/results.csv -e -o performance-tests/html-report -Jusers=50 -Jrampup=10 -Jloops=-1
    }
    default {
        Write-Host "Unknown test type. Use Smoke, Load, Stress, Spike, or Endurance."
    }
}
Write-Host "Done! Open html-report/index.html to view the dashboard."
