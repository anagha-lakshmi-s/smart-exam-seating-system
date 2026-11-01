# SeatIQ: Smart Exam Seating & Hall Allocation System

A full-stack web application that automatically generates exam seating so that students sitting near each other do not share the same branch or subject. It spreads students across halls, detects conflicts, and explains clearly why any student could not be placed.

## Features
- Student, subject, exam and hall management with validation
- Seats generated automatically from each hall's layout (rows x benches x seats per bench)
- Constraint-based seating algorithm with backtracking and conflict detection
- Configurable rules: different branch / subject beside, and in front / behind
- Multi-hall allocation, with unplaced students listed together with the reason
- Visual seating grid, with a click for student details
- Find My Seat for students, with their seat highlighted
- Dashboard and reports (hall-wise, student-wise, occupancy, unplaced), printable to PDF
- Mark students absent and regenerate; mark halls unavailable and regenerate
- CSV import for students, with a clear error for every bad row
- Admin and student roles, with login checked by the backend

## Tech stack
React (Vite) | Java 21, Spring Boot, Spring Data JPA | MySQL 8 | REST + JSON | Git/GitHub

## Architecture
React -> REST API (JSON) -> Spring Boot (controller -> service -> repository) -> MySQL.
The seating algorithm is plain Java in `backend/.../algorithm`, separate from the web and database code, and has its own unit tests.

## How the algorithm works
1. Seats are ordered hall by hall, row by row, left to right.
2. Students with the same branch and subject are grouped.
3. For each seat, the largest remaining group that breaks no enabled rule against the seats on its left and in front is placed.
4. If the search gets stuck it backtracks (within a step limit).
5. Students who cannot be placed without breaking a rule are reported as unplaced, never silently seated.

## Run it locally
Requirements: JDK 21, Node.js LTS, MySQL 8.

1. Create the database: `CREATE DATABASE seatsync_db;`
2. Create `backend/src/main/resources/application.properties` (it is git-ignored):
   ```
   spring.application.name=backend
   spring.datasource.url=jdbc:mysql://localhost:3306/seatsync_db
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   seatiq.admin.username=admin
   seatiq.admin.password=CHOOSE_A_PASSWORD
   ```
3. Backend: `cd backend`, then `./mvnw spring-boot:run` (http://localhost:8080)
4. Frontend: `cd frontend`, then `npm install` and `npm run dev` (http://localhost:5173)
5. Optional demo data (backend running): `powershell -ExecutionPolicy Bypass -File database/seed-demo-data.ps1`

## Tests
`cd backend`, then `./mvnw test "-Dtest=SeatingAlgorithmTest"` runs the algorithm unit tests.

## Limitations
- Neighbours are defined as the seat to the left and the seat in front.
- The algorithm uses a step limit; for very hard inputs the result is the best arrangement found, never one that breaks a rule.
- Login is checked on the server, but there are no tokens, so the API itself is not locked down. Spring Security with JWT is future work.

## Screenshots
See the `screenshots` folder.