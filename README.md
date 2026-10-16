# SwipeX — MERN Career Platform

Tagline: Build Skills. Shape Your Career.

## Stack
- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Postman for API testing

## Features in this starter project
- Student registration and login (bcrypt password hashing + JWT)
- Role-based admin routes
- Jobs: list, search, admin create/delete
- Student profile
- Resume data create/read/update
- Apply to jobs
- Admin dashboard: user/job/application counts and recent users
- Anonymous page-visit counting (aggregate counts only; no IP address is stored)

## Requirements
- Node.js LTS
- MongoDB Atlas or local MongoDB
- VS Code
- Postman

## 1. Configure MongoDB
Create a database in MongoDB Atlas or use local MongoDB. Copy the connection string.
See: https://www.mongodb.com/docs/atlas/getting-started/

## 2. Backend setup
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env`, then update `MONGO_URI` and `JWT_SECRET`.

Create your first admin account by registering a normal account first, then promote it directly in your database:
- In MongoDB, open `SwipeX.users`
- Change that account's `role` from `student` to `admin`
- Never expose a public endpoint that lets users choose their own role.

Run backend:

```bash
npm run dev
```

API runs at `http://localhost:5000`.

## 3. Frontend setup
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## 4. Postman quick checks
- GET `http://localhost:5000/api/health`
- POST `http://localhost:5000/api/auth/register`
  JSON body: `{ "name": "Demo Student", "email": "student@example.com", "password": "DemoPass123!" }`
- POST `http://localhost:5000/api/auth/login`
  JSON body: `{ "email": "student@example.com", "password": "DemoPass123!" }`
- For protected endpoints, add header `Authorization: Bearer YOUR_TOKEN`
- GET `/api/jobs`
- GET `/api/resume/me`
- GET `/api/admin/stats` using an admin token

## Notes
- This is a learning/demo starter, not production-hardened. Before public deployment, add rate limiting, email verification, password reset, stronger validation, secure deployment settings, and a proper privacy notice.
- The admin can view student profiles and resumes, so only grant admin access to trusted accounts.
- Visitor analytics count visits in aggregate and do not retain IP addresses.
