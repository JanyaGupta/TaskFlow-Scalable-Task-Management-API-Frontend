# TaskFlow-Scalable-Task-Management-API-Frontend

# 🚀 TaskFlow – Scalable Task Management API & Frontend

## 📌 Overview

TaskFlow is a full-stack web application featuring a scalable REST API with authentication, role-based access control, and a modern frontend UI.

---

## 🛠 Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT (Access & Refresh Tokens)
* **API Docs:** Swagger

---

## ✨ Features

### 🔐 Authentication

* User Registration & Login
* JWT-based authentication
* Refresh tokens & logout

### 👥 Role-Based Access

* User & Admin roles
* Protected routes
* Admin-only endpoints

### 📦 Task Management

* Create, Read, Update, Delete tasks
* User-specific tasks
* Admin task statistics

### ⚡ Security

* Password hashing
* Input validation
* Rate limiting
* Secure headers

---

## 💻 Frontend Features

* Login & Register UI
* Protected Dashboard
* Task CRUD operations
* Clean modern UI

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd taskflow
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` file:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints (Sample)

### Auth

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`
* GET `/api/v1/auth/me`

### Tasks

* GET `/api/v1/tasks`
* POST `/api/v1/tasks`
* DELETE `/api/v1/tasks/:id`

---

## 📸 Screenshots

###  Login Page
![Login Page](screenshots/Login Page.png)

###  Register Page
![Register Page](screenshots/Register Page.png)

###  Dashboard 
![Dashboard Overview](screenshots/Dashboard1.png)
![Dashboard Tasks](screenshots/Dashboard2.png)

### Task Management
![Tasks](screenshots/Task.png)

### API Documentation (Swagger)

#### API Views
![API1](screenshots/API1.png)
![API1](screenshots/API2.png)
![API1](screenshots/API3.png)

## 📈 Scalability

* Modular architecture for easy scaling
* Can be extended into microservices
* Supports caching (Redis-ready)
* Load balancing possible via Nginx


