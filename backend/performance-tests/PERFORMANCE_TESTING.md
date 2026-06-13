# Performance Testing Documentation & Deployment Readiness

This document outlines the Apache JMeter performance testing suite for our application and defines our Production Deployment Readiness Criteria.

## 📁 Directory Structure
All performance testing assets are located in `backend/performance-tests/`:
- `MasterPerformanceSuite.jmx`: The parameterized JMeter test plan covering Login, Dashboard, Inventory, and Customer search flows.
- `test_users.csv`: Contains the mock user credentials for simulating concurrent sessions.
- `run-tests.ps1`: The PowerShell execution wrapper.

## 🚀 How to Run Tests Locally
1. Install [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) and ensure it is added to your system `PATH`.
2. Open PowerShell and navigate to the `performance-tests` folder.
3. Run the wrapper script with your desired test type:
   ```powershell
   ./run-tests.ps1 -Type Smoke
   ./run-tests.ps1 -Type Load
   ./run-tests.ps1 -Type Stress
   ./run-tests.ps1 -Type Spike
   ```
4. Once completed, JMeter will generate an HTML dashboard folder called `html-report/`. Open `html-report/index.html` in your browser to view the beautiful graphs and metrics.

## 📊 CI/CD Pipeline Integration (GitHub Actions / GitLab)
To run these automatically on every PR before merging to Production:
1. Ensure the CI runner has Java installed.
2. Download JMeter using `wget` in the CI pipeline script.
3. Execute: `jmeter -n -t MasterPerformanceSuite.jmx -l results.csv -Jusers=50 -Jrampup=10`
4. Use a plugin (e.g., GitHub Actions `actions/upload-artifact`) to save `results.csv` and the `html-report` directory for review.

## ✅ Deployment Readiness Criteria
Before merging any massive architectural changes to Production, the application MUST pass the **Load Test (100 Users)** with the following metrics:

1. **Error Rate**: `< 1.00%`. (Zero 500 Internal Server Errors, Zero deadlocks).
2. **Response Times**:
   - Average Response Time: `< 500ms`
   - 90th Percentile (p90): `< 800ms`
   - 95th Percentile (p95): `< 1200ms`
3. **Throughput**: Stable Requests Per Second (RPS) with no sudden drops indicating thread pool exhaustion.
4. **Hardware Profiling**: 
   - CPU Usage on Node.js container must not exceed 85%.
   - PostgreSQL must not exhaust max connections (no `ECONNRESET` or connection timeout logs).
   - No memory leaks detected during a 4-hour Endurance test (Node heap size remains stable and garbage collects successfully).

## 🚨 Known Bottlenecks to Watch For
- **Dashboard Stats API**: This endpoint aggregates large amounts of data. If the Postgres database grows beyond 50,000 sales, watch for slow queries here. Consider adding Redis caching if `p95` exceeds 2000ms under load.
- **Connection Pooling**: PostgreSQL max connections are restricted. If JMeter simulates 500 users, Node.js connection pooling limits concurrent DB queries. If the pool queue backs up, API requests will hang and eventually timeout.
