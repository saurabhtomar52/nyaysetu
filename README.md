# NyaySetu

NyaySetu is a beginner-friendly legal-tech platform for citizens to find verified lawyers, send consultation requests, communicate through basic chat, and read legal updates.

## Phase 1 features

- Citizen and lawyer registration/login
- JWT authentication and role-based access
- Lawyer profiles and district/specialization search
- Admin verification and rejection
- Consultation requests
- Basic citizen-lawyer messages
- Legal news
- Static AI assistant UI

## Project structure

```text
nyaysetu/
  frontend/
  backend/src/
  database/schema.sql
  docker-compose.yml
  Dockerfile
  .env.example
```

## Run locally without Docker

### 1. Install Node.js and PostgreSQL

Install Node.js 20+ and PostgreSQL 14+.

### 2. Create the database

```powershell
psql -U postgres
```

In PostgreSQL:

```sql
CREATE DATABASE nyaysetu;
\q
```

Import the schema:

```powershell
psql -U postgres -d nyaysetu -f database/schema.sql
```

### 3. Configure the backend

Copy `.env.example` to `backend/.env` or project `.env`:

```text
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/nyaysetu
JWT_SECRET=your_private_random_secret
JWT_EXPIRES_IN=1d
```

### 4. Install and start the backend

```powershell
cd backend
npm install
npm start
```

API: `http://localhost:5000/api/health`

### 5. Open the frontend

Open `frontend/index.html` directly, or serve it:

```powershell
cd frontend
npx serve .
```

If using `npx serve`, open the URL printed in the terminal, usually `http://localhost:3000`.

## Run with Docker

```powershell
docker compose up --build
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:5000/api/health`
- PostgreSQL: `localhost:5432`

Stop and remove containers:

```powershell
docker compose down
```

To delete the database volume too:

```powershell
docker compose down -v
```

## Admin and test accounts

Create a citizen or lawyer through the registration page. The admin role should be assigned directly in PostgreSQL for Phase 1 development:

```sql
UPDATE users SET role='admin' WHERE email='your-admin@example.com';
```

Lawyers remain pending until an admin verifies them.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/lawyers`
- `GET /api/lawyers/:id`
- `POST /api/consultations`
- `GET /api/consultations/mine`
- `POST /api/messages`
- `GET /api/messages/:userId`
- `GET /api/news`
- `GET /api/admin/lawyers/pending`
- `PATCH /api/admin/lawyers/:id/verified`
- `PATCH /api/admin/lawyers/:id/rejected`

## AWS EC2 deployment note

Phase 1 can be deployed with Docker Compose on an EC2 instance. Open ports 22, 80, and 443 in the security group, then configure a domain and reverse proxy later. Store real secrets in EC2 environment variables or AWS Secrets Manager rather than committing `.env` files.
