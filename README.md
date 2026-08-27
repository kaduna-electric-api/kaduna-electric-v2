# ⚡ Kaduna Electric Token Vending System v2.0

A production-ready, full-stack web application for purchasing prepaid electricity tokens. Built with **Node.js**, **Express**, **MongoDB**, **React 18**, **Tailwind CSS**, and **Paystack** payment integration.

---

## ✨ What's New in v2.0

### Public Website
- **Professional Home Page** — Hero section with animated electricity effects, feature showcase, how-it-works, about section, FAQs, and CTA
- **About Us Page** — Company story, mission, values, and statistics
- **How It Works Page** — Step-by-step guide with visual flow
- **Fully Responsive** — Works on desktop, tablet, and mobile
- **Smooth Animations** — Framer Motion powered transitions

### Customer System
- **Professional Dashboard** — Stats cards, quick actions, recent transactions
- **Animated Counters** — Numbers animate on scroll
- **Meter Management** — Add, view, and remove multiple meters
- **Token Purchase Flow** — 4-step wizard: Select Meter → Enter Amount → Confirm → Payment → Success
- **Demo Payment Mode** — Safe for school presentations (shows "DEMO" badge)
- **Transaction History** — Paginated table with PDF receipt downloads
- **Complaint System** — Submit complaints with unique reference numbers (CMP-YYYYMMDD-XXXXX), track status (Pending → Under Review → Resolved)

### Admin Panel
- **Dark Theme Dashboard** — Professional admin interface with sidebar
- **Real-time Analytics** — Revenue charts, transaction status pie charts, animated statistics
- **User Management** — Search, view, activate/deactivate customers
- **Transaction Monitoring** — Search and filter all platform transactions
- **Complaint Management** — Respond to customer complaints, change status
- **Fully Responsive Admin** — Mobile-friendly admin sidebar

### Security Upgrades
- **Ownership Checks** — Customers cannot access other users' data by modifying IDs
- **JWT Authentication** — Stateless token-based auth with expiration
- **Bcrypt Hashing** — 12 salt rounds
- **Rate Limiting** — Protects auth endpoints and API
- **Helmet Headers** — Security headers
- **Input Validation** — express-validator on all routes
- **Admin Role Protection** — Separate middleware for admin routes
- **Webhook Signature Verification** — Secure Paystack webhooks

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Zustand + Framer Motion + Recharts |
| **Backend** | Node.js 20 + Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Payments** | Paystack (Nigeria) + Demo Mode |
| **PDF** | PDFKit |
| **Email** | Nodemailer (SMTP) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Paystack account (free test keys) — optional for demo mode

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kaduna-electric

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Payment Mode: demo | paystack
PAYMENT_MODE=demo

# Paystack (only needed for live mode)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Setup Key
ADMIN_SECRET_KEY=your-admin-secret-key
```

Start server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

Start app:
```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🧪 Testing

### Demo Payment (Default)
The app runs in DEMO mode by default. Payments process instantly without real money.

### Paystack Test Card
If you switch to `PAYMENT_MODE=paystack`:
- **Card:** `4084084084084081`
- **CVV:** `000`
- **Expiry:** Any future date
- **PIN:** `0000`

### Creating an Admin
```bash
POST /api/auth/setup-admin
{
  "email": "your-email@example.com",
  "secretKey": "your-admin-secret-key"
}
```

---

## 📁 Project Structure

```
kaduna-electric-v2/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, rate limiting, errors
│   │   ├── models/         # Mongoose schemas (User, Meter, Transaction, Complaint)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Payment (demo + paystack), tokens, email
│   │   ├── utils/          # Receipt generator
│   │   └── app.js          # Express entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/       # Login, Register, ForgotPassword
    │   │   ├── dashboard/  # Customer dashboard
    │   │   ├── meters/     # Meter management
    │   │   ├── payment/    # Buy token, success page
    │   │   ├── tokens/     # Transaction history
    │   │   ├── complaints/ # New complaint, complaint list
    │   │   ├── admin/      # Admin overview, users, transactions, complaints
    │   │   ├── public/     # Hero, Features, About, Footer, etc.
    │   │   └── ui/         # Navbar, Loading, AnimatedCounter
    │   ├── pages/          # Home, About, HowItWorks, Dashboard, Admin, NotFound
    │   ├── services/       # API client (Axios)
    │   ├── store/          # Zustand auth store
    │   ├── hooks/          # useAuth hook
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| POST | `/api/auth/setup-admin` | Assign admin role |

### Meters
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meters` | Add meter |
| GET | `/api/meters` | List meters |
| DELETE | `/api/meters/:id` | Remove meter |
| POST | `/api/meters/validate` | Validate meter number |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initialize` | Start payment |
| GET | `/api/payments/verify/:ref` | Verify payment |
| POST | `/api/payments/webhook` | Paystack webhook |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/history` | Paginated history |
| GET | `/api/transactions/:id/receipt` | Download PDF |
| GET | `/api/transactions/:id` | Get single transaction |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints` | My complaints |
| GET | `/api/complaints/admin` | All complaints (admin) |
| PUT | `/api/complaints/:id/respond` | Respond (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats + charts |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/transactions` | All transactions |
| GET | `/api/admin/meters` | All meters |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate |

---

## 🌐 Deployment

### Backend (Render/Railway)
- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to your frontend domain
- Add all environment variables

### Frontend (Vercel/Netlify)
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your backend URL

### Update CORS
In `backend/src/app.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## 🔐 Security Checklist

- [ ] Change default JWT secret to 32+ random characters
- [ ] Use strong MongoDB password
- [ ] Enable Paystack webhook signature verification
- [ ] Set up rate limiting (already configured)
- [ ] Use HTTPS in production
- [ ] Store `.env` files securely (never commit)
- [ ] Enable MongoDB IP whitelist
- [ ] Set strong ADMIN_SECRET_KEY
- [ ] Regular database backups

---

## 📝 License

MIT License — Free for personal and commercial use.

Built with ❤️ for Kaduna Electric customers.
