# Whisper Ledger - Spring Boot 3 & MySQL Backend

> **"Anonymous for Students, Accountable for Institutions"**  
> A privacy-first campus grievance management platform.

---

## 🛠️ Tech Stack
- **Framework**: Spring Boot 3.2.3
- **Java**: Java 17 LTS
- **Database**: MySQL 8.0+
- **Security**: Spring Security 6 + JJWT (Stateless JWT Bearer Auth)
- **ORM**: Spring Data JPA / Hibernate
- **AI**: Gemini API / Heuristic clustering engine
- **Build Tool**: Maven 3.8+

---

## 🗄️ Database Setup (MySQL)

1. Start your local MySQL server or Docker container:
   ```bash
   docker run --name whisper-mysql -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=whisper_ledger_db -p 3306:3306 -d mysql:8.0
   ```
2. Run `src/main/resources/schema.sql` to initialize tables, indexes, and constraints.
3. Configure `src/main/resources/application.properties` with your MySQL user/password.

---

## 🚀 Running the Spring Boot Application

1. **Build with Maven**:
   ```bash
   mvn clean package -DskipTests
   ```
2. **Start the Application**:
   ```bash
   mvn spring-boot:run
   ```
   Or run the generated JAR:
   ```bash
   java -jar target/whisper-ledger-backend-1.0.0.jar
   ```
3. Server will listen on **`http://localhost:8080`**.

---

## 📡 REST API Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register student or faculty | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| POST | `/api/complaints` | Submit anonymous complaint | Student |
| GET | `/api/complaints` | Get all complaints (masked) | Yes |
| GET | `/api/complaints/my` | Get current student's complaints | Student |
| GET | `/api/complaints/{id}` | Complaint detail & history | Yes |
| POST | `/api/complaints/{id}/support`| Anonymously support complaint ("Me Too") | Student |
| PUT | `/api/complaints/{id}/status` | Update complaint status | HOD / Dean / Committee / Admin |
| GET | `/api/chat/{complaintId}` | Fetch anonymous 2-way chat | Yes |
| POST | `/api/chat/send` | Send anonymous or staff message | Yes |
| GET | `/api/admin/dashboard` | Dashboard metrics & KPIs | Admin Roles |
| GET | `/api/admin/escalations`| Get automated escalation logs | Admin Roles |
| POST | `/api/admin/escalation/trigger`| Manually trigger escalation cycle | Admin Roles |
| GET | `/api/admin/alerts` | Get AI detected recurring problem alerts | Admin Roles |
| GET | `/api/analytics` | Department & Category statistics | No / Public |
