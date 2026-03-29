# TaskFlow REST API

**Scalable REST API with JWT Authentication, Role-Based Access Control, and a React frontend.**

Built with Node.js · Express · MongoDB · React · Docker

---

## Features

### Backend
- ✅ **JWT Authentication** — access tokens (7d) + refresh tokens (30d), auto-rotation
- ✅ **Role-Based Access Control** — `user` and `admin` roles with route-level guards
- ✅ **Task CRUD** — full create / read / update / delete with pagination, filtering, sorting
- ✅ **API Versioning** — all routes under `/api/v1/`
- ✅ **Input Validation** — `express-validator` on every endpoint
- ✅ **Swagger Docs** — interactive at `/api-docs`
- ✅ **Security** — Helmet, CORS, rate limiting, bcrypt (12 rounds), password-changed-at guard
- ✅ **Logging** — Winston with file + console transport, Morgan HTTP logs
- ✅ **Docker** — multi-stage Dockerfile for both services + docker-compose
- ✅ **Graceful Shutdown** — SIGTERM/SIGINT handling

### Frontend
- ✅ React 18 + React Router v6
- ✅ JWT-aware API service with automatic token refresh
- ✅ Register / Login with validation
- ✅ Protected dashboard (JWT required)
- ✅ Task CRUD — create, edit, delete with filters and pagination
- ✅ Admin panel — view all users, update roles, deactivate accounts
- ✅ Error / success feedback on every action

---

## Project Structure

```
taskflow-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── swagger.js         # OpenAPI 3.0 spec
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, login, refresh, logout, me
│   │   │   ├── taskController.js  # Full CRUD + stats
│   │   │   └── userController.js  # Admin user management
│   │   ├── middleware/
│   │   │   ├── auth.js            # authenticate, authorize, optionalAuth
│   │   │   ├── errorHandler.js    # Global error handler + 404
│   │   │   ├── rateLimiter.js     # Global + auth-specific limits
│   │   │   └── validate.js        # express-validator runner
│   │   ├── models/
│   │   │   ├── User.js            # Schema + bcrypt hooks + token checks
│   │   │   └── Task.js            # Schema + compound indexes
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/v1/auth/*
│   │   │   ├── task.routes.js     # /api/v1/tasks/*
│   │   │   └── user.routes.js     # /api/v1/users/* (admin)
│   │   ├── utils/
│   │   │   ├── apiResponse.js     # Standardised response helpers
│   │   │   ├── jwt.js             # Token generation + verification
│   │   │   └── logger.js          # Winston logger
│   │   ├── app.js                 # Express app config
│   │   └── server.js              # Entry point + graceful shutdown
│   ├── logs/                      # Runtime log files (git-ignored)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state + hooks
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # Fetch wrapper + auto token refresh
│   │   ├── App.jsx                # Routes + guards
│   │   ├── index.css              # Design system (CSS variables)
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── TaskFlow.postman_collection.json
├── SCALABILITY.md
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (or Docker)
- npm or yarn

### 1. Clone & configure

```bash
git clone https://github.com/yourusername/taskflow-api.git
cd taskflow-api

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET, JWT_REFRESH_SECRET, MONGODB_URI
```

**Minimum `.env` required:**
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_min_32_chars_here_change_this
JWT_REFRESH_SECRET=another_super_secret_min_32_chars_here
PORT=5000
```

### 2. Run the backend

```bash
cd backend
npm install
npm run dev
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend at http://localhost:3000
```

---

## Docker Deployment

```bash
# Copy and fill in secrets
cp backend/.env.example .env

# Start everything (API + Frontend + MongoDB + Redis)
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   API       → http://localhost:5000
#   API Docs  → http://localhost:5000/api-docs
#   MongoDB   → localhost:27017
#   Redis     → localhost:6379
```

---

## API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, receive tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout, revoke refresh token |
| GET | `/auth/me` | ✅ | Get current user profile |

**Register request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret123",
  "role": "user"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "email": "...", "role": "user" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": "7d"
  }
}
```

---

### Task Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/tasks` | ✅ | any | Get paginated tasks (filtered) |
| POST | `/tasks` | ✅ | any | Create a task |
| GET | `/tasks/:id` | ✅ | any | Get task by ID |
| PATCH | `/tasks/:id` | ✅ | any | Update task |
| DELETE | `/tasks/:id` | ✅ | any | Delete task |
| GET | `/tasks/stats` | ✅ | admin | Aggregated task statistics |

**Query params for GET /tasks:**
```
?page=1&limit=10&status=todo&priority=high&sortBy=createdAt&order=desc
```

**Create task request:**
```json
{
  "title": "Implement JWT auth",
  "description": "Add refresh token support",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-12-31",
  "tags": ["backend", "security"]
}
```

---

### User Endpoints (Admin Only)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users` | ✅ | admin | List all users (paginated) |
| GET | `/users/:id` | ✅ | admin | Get user by ID |
| PATCH | `/users/:id/role` | ✅ | admin | Change user role |
| PATCH | `/users/:id/deactivate` | ✅ | admin | Deactivate user |

---

### Standard Response Shape

**Success:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ],
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (DELETE) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## Database Schema

### User
```
_id          ObjectId   Primary key
name         String     2–50 chars
email        String     Unique, indexed
password     String     bcrypt (12 rounds), never returned
role         String     enum: user | admin
isActive     Boolean    Soft-delete flag
refreshToken String     Hashed, for token rotation
lastLogin    Date
passwordChangedAt Date  Guards against old tokens
createdAt    Date       Auto
updatedAt    Date       Auto
```

### Task
```
_id          ObjectId   Primary key
title        String     3–100 chars
description  String     Max 1000 chars
status       String     enum: todo | in-progress | done
priority     String     enum: low | medium | high
dueDate      Date       Must be future
tags         [String]   Max 10
owner        ObjectId   Ref → User (indexed)
isArchived   Boolean    Soft-archive flag
createdAt    Date       Auto
updatedAt    Date       Auto

Indexes:
  { owner, status }     — main query pattern
  { owner, createdAt }  — sorted dashboard
  { title, description } text — full-text search
```

---

## Security Practices

| Practice | Implementation |
|----------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| JWT signing | RS256-compatible HS256 with issuer + audience claims |
| Refresh token rotation | New refresh token issued on each refresh call |
| Old token invalidation | `passwordChangedAt` checked on every request |
| Input sanitisation | `express-validator` `.escape()` + `.trim()` on all user inputs |
| Rate limiting | 100 req/15min globally; 10 req/15min on auth endpoints |
| Security headers | Helmet (XSS, HSTS, CSP, frameguard, etc.) |
| CORS | Allowlist-based origin validation |
| Request size limit | 10kb body limit |
| Mongo injection | Mongoose schema types prevent operator injection |
| Privilege escalation | Admins cannot change their own role or deactivate themselves |

---

## API Documentation

Interactive Swagger UI available at:
```
http://localhost:5000/api-docs
```

To test authenticated endpoints in Swagger:
1. Call `POST /api/v1/auth/login`
2. Copy `accessToken` from response
3. Click **Authorize** (top right)
4. Paste token and confirm

Postman collection is also provided:
```
TaskFlow.postman_collection.json
```
Import into Postman — tokens are auto-saved to collection variables after login.

---

## Running Tests

```bash
cd backend
npm test          # Jest with coverage
npm test -- --watch  # Watch mode
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Access token signing key (32+ chars) |
| `JWT_EXPIRES_IN` | No | 7d | Access token lifetime |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN` | No | 30d | Refresh token lifetime |
| `ALLOWED_ORIGINS` | No | localhost:3000 | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |
| `LOG_LEVEL` | No | info | Winston log level |

---

## Scalability

See [`SCALABILITY.md`](./SCALABILITY.md) for a detailed breakdown covering:
- Horizontal pod scaling strategy
- MongoDB replica sets and sharding
- Redis caching layer
- Microservices decomposition path
- Kubernetes HPA configuration
- Load balancing (Nginx → AWS ALB)
- Observability stack (Prometheus + Grafana + OpenTelemetry)
- Estimated RPS capacity at different configurations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Docs | swagger-jsdoc + swagger-ui-express |
| Logging | Winston + Morgan |
| Security | Helmet + CORS + express-rate-limit |
| Frontend | React 18 + React Router 6 + Vite |
| Container | Docker + docker-compose |
| Cache (opt.) | Redis 7 |

---

*Built for the PrimeTrade Backend Developer Intern assignment.*
