# CareerHub — Full-Stack Career Portal

```
CareerHub/
├── client/   ← React 18 + Vite       → http://localhost:5173
├── server/   ← Express + MongoDB      → https://careerhub-api-mvti.onrender.com
└── pages/    ← Old HTML (reference only)
```

---

## ⚡ Quick Start (3 steps)

---

### Step 1 — Get a FREE MongoDB Atlas database (2 minutes)

> Local MongoDB is NOT needed. Atlas is free forever.

1. Go to **https://cloud.mongodb.com** → Sign Up (free)
2. Create a **FREE cluster** (M0 Sandbox, any region)
3. **Security → Database Access** → Add Database User
   - Username: `soham` (or anything)
   - Password: `yourpassword` (save this)
   - Role: `Atlas admin`
4. **Security → Network Access** → Add IP Address → `0.0.0.0/0` → Confirm
5. **Clusters → Connect → Drivers** → copy the connection string

It looks like:
```
mongodb+srv://soham:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 2 — Configure the server

Open `server/.env` and replace the MONGO_URI line:

```env
MONGO_URI=mongodb+srv://soham:yourpassword@cluster0.abc123.mongodb.net/careerhub?retryWrites=true&w=majority
```

Replace `soham`, `yourpassword`, and `cluster0.abc123` with your actual values.
Add `/careerhub` before the `?` — that's the database name.

---

### Step 3 — Start both servers

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
```

You should see:
```
✅  MongoDB Atlas connected
🚀  Server running  →  https://careerhub-api-mvti.onrender.com
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
```

Open → **http://localhost:5173**

**Seed internship data (run once):**
```bash
# PowerShell
Invoke-WebRequest -Uri https://careerhub-api-mvti.onrender.com/api/internships/seed -Method POST

# or in browser, just visit:
# https://careerhub-api-mvti.onrender.com/api/internships/seed  (won't work — needs POST)
# Use Postman or the PowerShell command above
```

---

## JWT Authentication Flow

```
Register / Login
      │
      ▼
Server returns:
  ├── accessToken   (15 min JWT — stored in memory only, never localStorage)
  └── refreshToken  (7 days — stored in localStorage, rotated on every use)
      │
      ▼
Every API request
  └── Authorization: Bearer <accessToken>
      │
      ▼
accessToken expires (15 min)?
  └── axios silently calls POST /api/auth/refresh
        ├── success → new token pair, request retried automatically
        └── failure → redirect to /login

Logout
  └── POST /api/auth/logout revokes refreshToken in MongoDB
```

**Security features:**
- Access tokens in memory only (not localStorage — XSS safe)
- Refresh token rotation on every use
- Reuse detection → entire token family revoked (theft protection)
- Rate limiting: 10 attempts per IP per 15 min
- Password hashed with bcrypt (10 rounds)
- Password reset hashes token in DB (not stored raw)
- Account deletion wipes all tokens

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| POST | `/api/auth/register` | | Register + get token pair |
| POST | `/api/auth/login` | | Login + get token pair |
| POST | `/api/auth/refresh` | | Silent token refresh |
| POST | `/api/auth/logout` | | Revoke refresh token in DB |
| GET  | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/forgot-password` | | Request password reset |
| POST | `/api/auth/reset-password/:token` | | Reset password |
| GET  | `/api/user/profile` | ✅ | Get full profile |
| PUT  | `/api/user/profile` | ✅ | Update profile + preferences |
| PUT  | `/api/user/password` | ✅ | Change password |
| DELETE | `/api/user/account` | ✅ | Delete account |
| GET  | `/api/skills` | ✅ | List skills |
| POST | `/api/skills` | ✅ | Add skill |
| PUT  | `/api/skills/:id` | ✅ | Edit skill |
| DELETE | `/api/skills/:id` | ✅ | Delete skill |
| GET  | `/api/internships` | | List (`?category=&search=`) |
| POST | `/api/internships/apply/:id` | ✅ | Apply to internship |
| GET  | `/api/internships/my-applications` | ✅ | My applications |
| POST | `/api/internships/seed` | | Seed demo data |
| POST | `/api/resume/upload` | ✅ | Upload + analyse resume |
| GET  | `/api/resume` | ✅ | Get resume data |
| GET  | `/api/interview/questions/:type` | ✅ | Get questions |
| POST | `/api/interview/feedback` | ✅ | Get AI feedback |
| GET  | `/api/health` | | Server health check |

---

## Tech Stack

| | Tech |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Recharts 3, React Icons, Axios |
| **Backend** | Express 4, MongoDB Atlas + Mongoose, JWT (access + refresh), bcryptjs |
| **File upload** | Multer |
| **AI** | Google Gemini (optional) |
