# PharmaCare CRM

A full-stack pharmacy CRM for chronic patient follow-up and treatment renewal management. Built for small to medium pharmacies that need to track prescriptions, schedule follow-ups, and manage patient communications — no billing, inventory, or accounting.

---

## Features

- **Patient Management** – Register, edit, and search patients. Track DNI, health insurance, member numbers, and status.
- **Prescriptions** – Create prescriptions with multiple medications. Auto-generates a follow-up record on creation.
- **Medication Catalog** – Manage a reusable catalog of medications (name, brand, drug, laboratory).
- **Follow-Up Kanban** – Drag & drop board to manage follow-up statuses: prescription received, pending contact, contacted, delivered.
- **Activity Timeline** – Chronological view of every event per patient (registration, prescriptions, pickups, follow-ups).
- **Dashboard Metrics** – At-a-glance KPIs: patients to contact today, pending prescriptions, ready for pickup, overdue patients.
- **User Management** – Admin panel for managing system users (create, edit, delete).
- **Contacts & Notifications** – Log patient contacts and view system notifications.
- **Authentication** – JWT-based login with role support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Redux Toolkit, React Router v7, Tailwind CSS, Axios, Vite |
| **Backend** | Node.js 22, TypeScript, Express 4, Sequelize 6, PostgreSQL |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Validation** | express-validator |
| **Deployment** | Railway (API), Vercel (client) |

---

## Project Structure

```
PharmacyCRM/
├── api/                    # Backend (Express + Sequelize)
│   ├── config/             # Database configuration
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handler, validation
│   ├── models/            # Sequelize models (8)
│   ├── routes/            # Express route definitions
│   └── server.ts          # Entry point
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/            # Axios client & API functions
│   │   ├── components/     # Shared UI components
│   │   ├── features/       # Feature-based modules
│   │   ├── store/          # Redux store configuration
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── vercel.json         # Vercel SPA rewrites
│   └── vite.config.ts      # Vite configuration with proxy
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 14+ running locally on port 5432
- npm

### Local Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE pharmacycrm;"
```

### Backend Setup

```bash
cd api
npm install
npm run dev
```

The API starts on **http://localhost:4000**.

On first startup, if no users exist, an admin user is created automatically.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client starts on **http://localhost:5173** with API requests proxied to `localhost:4000`.

---

## Environment Variables

### Backend (`api/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default: 4000) |
| `DB_HOST` | PostgreSQL host (default: localhost) |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name (default: pharmacycrm) |
| `DB_USER` | Database user (default: postgres) |
| `DB_PASSWORD` | Database password (default: 1234) |
| `DB_DEPLOY` | Full connection URL for Railway (with SSL); overrides individual DB_* vars when set |
| `JWT_SECRET` | Secret key for JWT signing |

### Frontend (`client/.env` or Vercel env)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL for production (e.g. `https://api.example.com/api`). Falls back to `/api` in dev (proxied by Vite). |

---

## Default Credentials

| Email | Password |
|---|---|
| `admin@pharmacare.com` | `PharmaCare2026` |

---

## API Endpoints

All endpoints return `{ success: boolean, data?: ..., message?: string }`.

### Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with email & password |
| GET | `/api/auth/me` | Get current user from token |

### Patients

| Method | Path | Description |
|---|---|---|
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/:id` | Get patient by ID |
| POST | `/api/patients` | Create a patient |
| PUT | `/api/patients/:id` | Update a patient |
| DELETE | `/api/patients/:id` | Delete a patient |

### Prescriptions

| Method | Path | Description |
|---|---|---|
| GET | `/api/prescriptions` | List prescriptions (filter by `?patientId=`) |
| POST | `/api/prescriptions` | Create prescription (auto-creates follow-up) |
| PUT | `/api/prescriptions/:id` | Update prescription |
| DELETE | `/api/prescriptions/:id` | Delete prescription |

### Medications

| Method | Path | Description |
|---|---|---|
| GET | `/api/medications` | List all medications |
| POST | `/api/medications` | Create a medication |
| PUT | `/api/medications/:id` | Update a medication |
| DELETE | `/api/medications/:id` | Delete a medication |

### Follow-Ups

| Method | Path | Description |
|---|---|---|
| GET | `/api/followups` | List all follow-ups |
| PUT | `/api/followups/:id` | Update follow-up status or details |

### Contacts

| Method | Path | Description |
|---|---|---|
| GET | `/api/contacts` | List contacts (filter by `?patientId=`) |
| POST | `/api/contacts` | Create a contact log |

### Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications/:id/read` | Mark as read |

### Users

| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List all users (admin only) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

### Dashboard

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/metrics` | Returns KPIs: patientsToContactToday, pendingPrescriptions, readyForPickup, overduePatients |

---

## Database Models

| Model | Table | Key Fields |
|---|---|---|
| **User** | `users` | email, password (hashed), name, role |
| **Patient** | `patients` | name, dni, phone, email, healthInsurance, memberNumber, status, nextFollowUpDate |
| **Medication** | `medications` | name, brand, drug, laboratory |
| **Prescription** | `prescriptions` | patientId, patientName, lastPickupDate, nextPickupDate, notes |
| **PrescriptionMedication** | `prescription_medications` | prescriptionId, medicationId, medicationName, quantity |
| **FollowUp** | `follow_ups` | patientId, prescriptionId, medication, status, scheduledDate, notes |
| **Contact** | `contacts` | patientId, type, notes |
| **Notification** | `notifications` | userId, message, read |

All models use UUID primary keys and include `createdAt` / `updatedAt` timestamps.

---

## Deployment

- **Backend**: Deployed on Railway. The `DB_DEPLOY` environment variable provides a full PostgreSQL connection URL with SSL. On first deploy, the admin user is auto-created.
- **Frontend**: Deployed on Vercel. Set `VITE_API_URL` to the Railway API URL. `vercel.json` rewrites all routes to `index.html` for SPA support.
