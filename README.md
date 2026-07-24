# MedLync 💊

A full-stack prescription management system for Doctors, Patients, and Pharmacies — with phone OTP verification via Twilio.

---

## Live Demo

- **Frontend:** https://medlync-frontend.onrender.com
- **Backend:** https://medlync-server.onrender.com

---

## Features

- 👨‍⚕️ **Doctor** — Create and manage prescriptions, add hospital doctors
- 🧑‍⚕️ **Patient** — View prescriptions, manage family members
- 🏪 **Pharmacy** — Verify and dispense prescriptions via code or barcode
- 📱 **Phone OTP** — Twilio SMS verification on signup
- 🔐 **JWT Authentication** — Secure login/signup
- 📸 **Profile Photo Upload** — For patient accounts
- 👨‍👩‍👧 **Family Members** — Add minors under a parent account

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| SMS OTP | Twilio |
| File Upload | Multer |

---

## Project Structure

```
rx-guardian-main/
├── src/                  # Frontend (React + TypeScript)
│   ├── pages/            # Signup, Login, Dashboards
│   ├── components/       # UI components
│   ├── contexts/         # Auth context
│   └── lib/              # API functions
├── server/               # Backend (Node.js + Express)
│   ├── index.js          # Main server file
│   ├── db.js             # PostgreSQL connection
│   ├── schema.sql        # Database schema
│   └── .env              # Environment variables
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Twilio account (free trial works)

---

### 1. Clone the repository
```bash
git clone https://github.com/your-username/medlync.git
cd medlync
```

### 2. Setup the database
- Create a PostgreSQL database
- Run the schema:
```bash
psql -U postgres -d your_database -f server/schema.sql
```

### 3. Configure environment variables
Create `server/.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
JWT_SECRET=your-secret-key
DB_CONNECTION_STRING=postgresql://user:password@localhost:5432/your_database
```

### 4. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### 5. Run the app

**Start backend** (Terminal 1):
```bash
cd server
npm run dev
```
Server runs at `http://localhost:3001`

**Start frontend** (Terminal 2):
```bash
npm run dev
```
App runs at `http://localhost:5173`

---

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/send-signup-otp` | Send OTP to phone |
| POST | `/api/auth/verify-signup-otp` | Verify signup OTP |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |

### Prescriptions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/prescriptions/create` | Create prescription |
| GET | `/api/prescriptions/list` | List prescriptions |
| GET | `/api/prescriptions/verify` | Verify by code |
| GET | `/api/prescriptions/patients` | Search patients |

### Pharmacy
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/pharmacy/dispense` | Dispense prescription |
| GET | `/api/pharmacy/transactions` | Get transactions |

### OTP (Prescription Pickup)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/prescriptions/send-otp` | Send pickup OTP |
| POST | `/api/prescriptions/verify-otp` | Verify pickup OTP |

---

## Signup Flow

1. Fill in name, email, password, role, phone
2. Click **"Send OTP"** → receive SMS on phone
3. Enter OTP → click **"Verify"**
4. Complete remaining details → **"Create Account"**

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) or [Render](https://render.com) |
| Backend | [Render](https://render.com) |
| Database | [Neon](https://neon.tech) or [Render PostgreSQL](https://render.com) |

---

## Environment Variables (Production)

```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
JWT_SECRET=strong-random-secret
DB_CONNECTION_STRING=your_production_db_url
```

---

## License

MIT
