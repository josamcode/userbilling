# User Billing Management System

## Short Description

User Billing Management System is a full-stack billing dashboard for managing customers, invoices, payments, and billing summaries. The application includes an authenticated admin interface, a Next.js frontend, and an Express/MongoDB backend API.

## Features

- Admin login with JWT-based authentication
- Customer management with name, email, country, and profile image upload
- Bill creation, editing, listing, and deletion
- Bill payment tracking with paid, partial, and unpaid statuses
- Add payments to existing bills
- Search and filter users and bills
- User detail pages with related bills and payment summary
- Dashboard statistics for users, bills, paid totals, and remaining balances
- Cloudinary-backed user image uploads

## Tech Stack

### Frontend

- Next.js 15
- React 19
- Tailwind CSS
- Axios / Fetch API
- React Hook Form
- Zod
- Framer Motion
- Lucide React
- Radix UI

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- Multer
- Cloudinary
- CORS
- dotenv

## Project Structure

```text
userbilling-main/
|-- backend/
|   |-- controllers/        # API request handlers
|   |-- lib/                # Shared backend utilities
|   |-- middleware/         # Auth middleware
|   |-- models/             # Mongoose models
|   |-- public/             # Legacy static image assets
|   |-- routes/             # Express API routes
|   |-- .env.example        # Backend environment example
|   |-- package.json
|   `-- server.js           # Express app entry point
|-- frontend/
|   |-- public/             # Frontend static assets
|   |-- src/
|   |   |-- app/            # Next.js app routes/pages
|   |   |-- components/     # Reusable UI components
|   |   `-- lib/            # Frontend API/auth helpers
|   |-- .env.example        # Frontend environment example
|   `-- package.json
|-- .gitignore
`-- README.md
```

## How to Run Locally

### Prerequisites

- Node.js 18 or newer
- npm or pnpm
- MongoDB running locally or a MongoDB connection string
- Cloudinary account if you want customer image uploads

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd userbilling-main

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

Create backend and frontend environment files from the examples:

```bash
cd backend
cp .env.example .env

cd ../frontend
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

### 3. Start the backend

```bash
cd backend
npm start
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
DB_URL=mongodb://localhost:27017/userbilling
PORT=5000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-string
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- `DB_URL` can also be provided as `MONGODB_URI`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used for the single admin login.
- `JWT_SECRET` should be a long random value in production.
- `CORS_ORIGINS` should include the frontend URL.
- Cloudinary values are required for profile image uploads.

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## API / Backend Notes

Base URL:

```text
http://localhost:5000
```

Public routes:

- `GET /api/health`
- `POST /api/auth/login`

Authenticated routes require:

```text
Authorization: Bearer <token>
```

Main API routes:

- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/users/:id/bills`
- `GET /api/users/:id/details`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/bills`
- `GET /api/bills/:id`
- `POST /api/bills`
- `PUT /api/bills/:id`
- `DELETE /api/bills/:id`
- `POST /api/bills/:id/payments`
- `GET /api/stats`

Backend behavior:

- The backend connects to MongoDB using `DB_URL` or `MONGODB_URI`.
- User images are uploaded with `multipart/form-data` and stored in Cloudinary.
- Bill payment status is derived from the payments list.
- Legacy bill fields are still handled for backward compatibility.

## Author

Add your name here.
