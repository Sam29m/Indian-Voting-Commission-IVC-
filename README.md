# 🗳️ Indian Voting Commission (IVC)

A production-grade, secure digital voting platform for India with Triple-Lock Authentication, role-based access, tamper-proof audit logging, and multilingual support.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Triple-Lock Auth** | OTP → Aadhaar → Face Verification |
| **Role-Based Access** | Voter, Candidate, Admin |
| **Secure Voting** | One-vote-per-election with SHA-256 receipts |
| **Election Lifecycle** | Draft → Scheduled → Active → Completed |
| **Audit Logging** | Hash-chained tamper-aware logs |
| **Support Tickets** | Create, track, and resolve issues |
| **Mitra AI** | Built-in voting assistant |
| **Multilingual** | English, हिंदी, தமிழ் |
| **Dashboards** | Voter, Candidate, Admin dashboards |

## 🏗️ Architecture

| Layer | Technology | Port |
|-------|-----------|------|
| **Frontend** | React + Vite | `http://localhost:3000` |
| **Backend API** | Express.js + MongoDB | `http://localhost:5000` |
| **Database** | MongoDB (with in-memory fallback) | Auto |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (optional — auto-uses in-memory if not available)

### 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the Backend

```bash
cd server
npm run dev
```

API runs at `http://localhost:5000`

### 3. Start the Frontend

```bash
cd client
npm run dev
```

UI runs at `http://localhost:3000`

### 4. Open the App

```
http://localhost:3000
```

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ivc.gov.in | admin123 |
| **Voter** | priya@example.com | voter123 |
| **Voter** | amit@example.com | voter123 |
| **Candidate** | sunita@example.com | candidate123 |
| **Candidate** | rahul@example.com | candidate123 |

## 🔐 Triple-Lock Authentication Flow

1. **Credentials** — Email + Password
2. **OTP Verification** — 6-digit code (shown in demo mode)
3. **Aadhaar Verification** — 12-digit number (simulated)
4. **Face Verification** — Camera-based (simulated with skip option)

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login (starts Triple-Lock) |
| POST | `/api/auth/send-otp` | — | Send OTP |
| POST | `/api/auth/verify-otp` | — | Verify OTP |
| POST | `/api/auth/verify-aadhaar` | — | Verify Aadhaar |
| POST | `/api/auth/complete-login` | — | Complete login after MFA |
| GET | `/api/auth/me` | JWT | Current user |

### Elections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/elections` | — | List elections |
| GET | `/api/elections/:id` | — | Election details |
| POST | `/api/elections` | Admin | Create election |
| PUT | `/api/elections/:id` | Admin | Update election |

### Voting
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/votes/cast` | JWT | Cast vote |
| GET | `/api/votes/check/:electionId` | JWT | Check if voted |
| GET | `/api/votes/receipt/:receiptId` | — | Get receipt |
| GET | `/api/votes/history` | JWT | Vote history |

### Candidates
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/candidates` | — | List candidates |
| GET | `/api/candidates/election/:id` | — | Election candidates |
| POST | `/api/candidates/register` | JWT | Register as candidate |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/voter` | JWT | Voter dashboard |
| GET | `/api/dashboard/candidate` | JWT | Candidate dashboard |
| GET | `/api/dashboard/admin` | Admin | Admin dashboard |

### Support & AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | JWT | Create ticket |
| GET | `/api/tickets` | JWT | List tickets |
| POST | `/api/mitra/chat` | — | Chat with Mitra AI |
| GET | `/api/audit` | Admin | Audit logs |

## 📁 Project Structure

```
├── server/                  # Express.js Backend
│   ├── config/db.js         # MongoDB connection (+ in-memory fallback)
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── otpController.js
│   │   ├── aadhaarController.js
│   │   ├── voteController.js
│   │   ├── candidateController.js
│   │   ├── electionController.js
│   │   ├── dashboardController.js
│   │   ├── auditController.js
│   │   ├── ticketController.js
│   │   └── mitraController.js
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Election.js
│   │   ├── Vote.js
│   │   ├── AuditLog.js
│   │   └── SupportTicket.js
│   ├── middleware/           # Auth, RBAC, Rate limiting
│   ├── routes/              # API routes
│   └── server.js            # Entry point
├── client/                  # React Frontend (Vite)
│   └── src/
│       ├── pages/           # All page components
│       ├── components/      # Reusable UI components
│       ├── context/         # Auth + Language contexts
│       └── api/             # Axios client
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Passwordless OTP login flow
- Input validation on all endpoints
- Rate limiting (auth: 20/15min, API: 200/15min)
- SHA-256 hash-chain audit logs
- RBAC (Role-Based Access Control)
- No plaintext sensitive data storage
- CORS restricted to frontend origin

## License

MIT
