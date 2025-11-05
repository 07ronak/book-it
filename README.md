# 🎫 BookIt - Experience Booking Platform

A full-stack experience booking application with secure payment flow, real-time availability tracking, and promo code support.

## 🌐 Live Demo

**Frontend:** https://book-it-pearl-ten.vercel.app/experiences  
**Backend:** https://book-it-production.up.railway.app/

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15 · TypeScript · Tailwind CSS · React Hooks  
**Backend:** Node.js · Express.js · Prisma ORM · PostgreSQL (Neon.tech)

### Deployment

- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

---

## 📁 Project Structure

```
BookIt/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Home page
│   │   │   ├── layout.tsx                    # Root layout
│   │   │   ├── booking-success/
│   │   │   │   └── page.tsx                  # Success page
│   │   │   └── experiences/
│   │   │       ├── page.tsx                  # Experience list
│   │   │       └── [id]/
│   │   │           ├── page.tsx              # Experience details
│   │   │           └── checkout/
│   │   │               └── page.tsx          # Checkout page
│   │   │
│   │   └── components/
│   │       ├── Navbar.tsx                    # Navigation bar
│   │       ├── ExperienceCard.tsx            # Experience card
│   │       ├── ExperienceDetailsPage.tsx     # Details view
│   │       └── CheckoutPage.tsx              # Checkout form
│   │
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                     # Database schema
│   │   ├── seed.ts                           # Seed data
│   │   └── migrations/                       # Database migrations
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── experienceController.js       # Experience logic
│   │   │   ├── bookingController.js          # Booking logic
│   │   │   └── promoController.js            # Promo validation
│   │   │
│   │   ├── routes/
│   │   │   ├── experienceRoutes.js           # Experience endpoints
│   │   │   ├── bookingRoutes.js              # Booking endpoints
│   │   │   └── promoRoutes.js                # Promo endpoints
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js               # Error handling
│   │   │
│   │   ├── utils/
│   │   │   └── validators.js                 # Input validation
│   │   │
│   │   └── server.js                         # Express server
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd BookIt
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL and other configs
```

**`.env` file:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookit"
PORT=5000
NODE_ENV=development
```

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
```

**`.env.local` file:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## ✨ Key Features

### 🔒 Security-First Architecture

- **Server-side pricing validation** - All prices fetched from database, never from client
- **Atomic database transactions** - Multi-step bookings in single transaction prevents race conditions
- **Pre-transaction validation** - Early checks for experience/slot existence before locking resources
- **In-transaction availability checks** - Re-fetches slot data inside transaction for accurate availability
- **Defense-in-depth validation** - Multiple validation layers including post-update verification
- **Double promo validation** - Frontend UX + Backend security checks with usage limit enforcement
- **SQL injection prevention** - Prisma ORM with parameterized queries

### 📅 Smart Booking System

- **Real-time availability tracking** - Live slot counts with booking increments
- **Date & time slot selection** - Dynamic scheduling with future-only slots
- **Quantity-based pricing** - Multi-person bookings with capacity checks
- **Automatic sold-out detection** - Prevents overbooking with transaction-level locks
- **Booking verification** - Reference ID-based booking confirmation
- **Search functionality** - Filter experiences by title, description, or location

### 💰 Pricing & Payments

- **Dynamic price calculation** - Subtotal, taxes (18% GST), total
- **Promo code support** - Percentage & fixed discounts with validation
- **Usage limit enforcement** - Prevents over-usage of promo codes
- **Min amount requirements** - Configurable minimum booking amounts
- **Max discount caps** - Optional maximum discount limits for percentage promos
- **Transparent pricing breakdown** - Clear cost display with discount savings

### 📱 User Experience

- **Responsive design** - Mobile-first UI
- **Booking confirmation** - Unique reference ID generation
- **Form validation** - Real-time input checks
- **Error handling** - User-friendly error messages

### 🗄️ Data Models

- **Experiences** - Title, description, pricing, images
- **Time Slots** - Date, time, availability tracking
- **Bookings** - Customer details, booking status
- **Promo Codes** - Discount rules, usage limits

---

## 🔄 User Flow

1. **Browse** → View available experiences
2. **Select** → Choose date, time, quantity
3. **Checkout** → Fill details, apply promo
4. **Confirm** → Server validates & creates booking
5. **Success** → Receive booking reference ID

---

## 📝 API Endpoints

### Experiences

- `GET /api/experiences` - List all experiences (with optional search)
- `GET /api/experiences/:id` - Get experience details with available slots

### Bookings

- `POST /api/bookings` - Create new booking with availability check
- `GET /api/bookings/verify?refId=XXX` - Verify booking by reference ID

### Promo Codes

- `POST /api/promo/validate` - Validate promo code and calculate discount

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---
