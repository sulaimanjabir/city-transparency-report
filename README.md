# City Transparency Report

A civic accountability web application built as a Final Year Project (FYP). It enables citizens of Mardan to report public issues, track departmental responses, and collectively verify whether resolutions are genuine — through a community-driven voting mechanism.

---

## The Core Idea

Traditional complaint portals let government departments self-report resolutions. This system introduces **community mandate voting**: a case is only marked as *Resolved* when ≥75% of all citizens who reported that issue vote that it has genuinely been fixed. If the vote falls below the threshold, the case becomes *Disputed* — a permanent public record that the department's resolution was rejected by citizens.

---

## Features

- **Citizens** can file complaints, join existing cases for the same issue, and vote on departmental resolutions
- **Department Admins** manage cases assigned to their department — mark in-progress, upload proof, and mark as solved
- **Super Admin** creates and manages department official accounts across all departments
- **Live vote progress bar** showing resolved vs. disputed vote ratio per case
- **Transparent feed** showing all active cases in the city sorted by community engagement
- **Anonymous reporting** option for citizens who prefer privacy

---

## Complaint Lifecycle

```
pending → verifying_in_progress → verifying → resolved
                                             ↘ disputed
```

| Status | Trigger |
|---|---|
| `pending` | Citizen submits a complaint |
| `verifying_in_progress` | Dept admin acknowledges and starts working |
| `verifying` | Dept admin marks it solved (with photo proof) |
| `resolved` | ≥75% of reporters vote "Yes, fixed" |
| `disputed` | All reporters voted, <75% said "fixed" — permanent record |

Resolution is only finalized once **every reporter has cast a vote**, ensuring no single user can prematurely close a case.

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| **NestJS** | Server framework — modular, decorator-driven |
| **MongoDB** | NoSQL database for flexible document storage |
| **Mongoose** | ODM — schema validation, population, ObjectId handling |
| **Passport + JWT** | Stateless authentication via Bearer tokens |
| **bcrypt** | Secure password hashing |
| **class-validator** | DTO-level request validation |

### Frontend
| Technology | Role |
|---|---|
| **React 19 + Vite** | UI library with fast HMR dev server |
| **TypeScript** | Static typing across all components and API calls |
| **Tailwind CSS v4** | Utility-first styling with `@tailwindcss/vite` plugin |
| **shadcn/ui** | Accessible, unstyled component primitives (Radix UI) |
| **Zustand** | Lightweight global auth state, persisted to localStorage |
| **Axios** | HTTP client with JWT interceptor and 401 auto-redirect |
| **React Router v6** | Client-side routing with protected role-based routes |
| **React Hot Toast** | Non-blocking user feedback notifications |

---

## Project Structure

```
govt/
├── backend/
│   └── src/
│       ├── auth/              # JWT strategy, guards, login/register/create-admin
│       ├── cases/             # Complaint submission, join, status transitions, feeds
│       ├── votes/             # Community vote casting and resolution recalculation
│       ├── users/             # User management, dept admin listing
│       ├── cities/            # City lookup (public)
│       ├── departments/       # Department lookup by city (public)
│       ├── complaint-types/   # Complaint type lookup by department (public)
│       └── database/
│           ├── schemas/       # Mongoose schemas: User, MasterCase, UserReport, Vote, City, Department, ComplaintType
│           └── seeder.service.ts  # Idempotent DB seeder (runs once on bootstrap)
│
└── frontend/
    └── src/
        ├── api/               # Axios API modules per domain
        ├── components/
        │   ├── cases/         # ComplaintCard, VoteModal, JoinCaseModal, SubmitComplaintFAB
        │   └── layout/        # CitizenLayout, DeptAdminLayout, SuperAdminLayout
        ├── pages/
        │   ├── auth/          # LoginPage, RegisterPage
        │   ├── citizen/       # CitizenDashboard (feed + my submissions)
        │   ├── dept-admin/    # DeptAdminDashboard (case management + filters)
        │   └── super-admin/   # SuperAdminDashboard (create dept admins)
        ├── routes/            # ProtectedRoute (role-based guard)
        └── store/             # Zustand auth store
```

---

## Architecture

### Backend — Modular NestJS
Each domain (auth, cases, votes, users, etc.) is an isolated NestJS module with its own controller, service, and DTOs. Modules explicitly declare their exports, keeping dependencies clean and testable.

### Authentication & Authorization
- Login issues a signed JWT containing `userId`, `email`, `role`, `cityId`, `departmentId`
- Every protected endpoint uses `JwtAuthGuard` (validates token) + `RolesGuard` (checks `@Roles()` decorator)
- Department admins are scoped at the service layer — they can only act on cases belonging to their `departmentId`

### Data Model
- **MasterCase** aggregates all reports of the same issue (same city + department + complaint type). Citizens join the same master case rather than creating duplicates — this is the `findOrCreate` pattern.
- **UserReport** stores each individual citizen's description and location for a case.
- **Vote** has a compound unique index on `(userId, masterCaseId)` — enforced at both DB and application level to prevent double voting.

### Vote Resolution Logic
```
resolvedPct = resolvedVotes / totalReporters
if (allReportersVoted && resolvedPct >= 0.75) → RESOLVED
if (allReportersVoted && resolvedPct <  0.75) → DISPUTED
```
Resolution recalculates on every vote event. The case stays in `verifying` until every reporter has voted.

### Frontend — Component Architecture
- **API layer** (`src/api/`) is completely decoupled from UI — each module exports typed async functions
- **Auth state** lives in Zustand, persisted to localStorage, consumed anywhere via `useAuthStore()`
- **ProtectedRoute** wraps each route and checks `user.role` against `allowedRoles` before rendering
- **Layout components** are role-specific shells (sidebar + main area) that accept children, keeping page components free of navigation concerns

---

## Software Engineering Principles Applied

### Separation of Concerns
Controller → Service → Schema. Controllers only handle HTTP I/O. Services contain all business logic. Schemas define data shape. No business logic leaks into controllers or schemas.

### Single Responsibility Principle
Each NestJS service has one job. `VotesService` handles voting and recalculation. `CasesService` handles complaint lifecycle. `UsersService` handles user operations. They do not cross-call except through explicit module imports.

### DRY (Don't Repeat Yourself)
- `findOrCreate` pattern prevents duplicate case creation across the codebase
- Layout components are reused across pages — no copy-pasted sidebars
- Shared `StatusBadge` component renders consistently in both citizen and dept-admin views

### Role-Based Access Control (RBAC)
Three roles with strictly enforced boundaries. The `@Roles()` decorator + `RolesGuard` on the backend, and `ProtectedRoute` on the frontend, ensure no role can access another's resources. Department admins are additionally scoped to their own department at the service layer.

### Fail-Safe Defaults
- Votes cannot be cast twice (DB-level unique index + application-level check)
- Cases cannot be resolved prematurely — all reporters must vote
- Disputed cases cannot be deleted — they are permanent public records
- JWT expiry is enforced; expired tokens trigger automatic logout via Axios interceptor

### Idempotent Seeding
The `SeederService` checks for existing data before inserting. Re-running the server never duplicates seed data (city, departments, complaint types, super admin).

### Optimistic UI + Server Validation
Frontend validates inputs (description length, required fields) before sending requests, giving instant feedback. Backend re-validates everything independently via `ValidationPipe` with `whitelist: true`, which strips any fields not declared in the DTO.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
npm install
# create .env with:
# MONGODB_URI=mongodb://localhost:27017/govt-app
# JWT_SECRET=your_secret_here
# JWT_EXPIRES_IN=7d
# PORT=5000
npm run start:dev
```

On first start, the seeder automatically creates:
- Mardan city with 8 departments and all complaint types
- Super Admin account: `admin@mardan.gov.pk` / `superadmin123`

### Frontend
```bash
cd frontend
npm install
# create .env with:
# VITE_API_URL=http://localhost:5000
npm run dev
```

### Default Accounts
| Role | Email | Password |
|---|---|---|
| Super Admin | admin@mardan.gov.pk | superadmin123 |
| Dept Admin | created via Super Admin panel | set at creation |
| Citizen | register at /register | set at registration |

---

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as citizen |
| POST | `/auth/login` | Public | Login, receive JWT |
| POST | `/auth/create-dept-admin` | Super Admin | Create dept official account |
| GET | `/cities` | Public | List all cities |
| GET | `/departments?cityId=` | Public | List departments by city |
| GET | `/complaint-types?departmentId=` | Public | List complaint types |
| POST | `/cases` | Citizen | Submit a complaint |
| POST | `/cases/:id/join` | Citizen | Join an existing case |
| GET | `/cases/feed/:cityId` | Citizen | Get city-wide feed |
| GET | `/cases/my` | Citizen | Get my submitted cases |
| PUT | `/cases/:id/in-progress` | Dept Admin | Mark case in progress |
| PUT | `/cases/:id/solve` | Dept Admin | Mark case solved with proof |
| GET | `/cases/department` | Dept Admin | Get department's cases |
| POST | `/votes/:caseId` | Citizen (reporter) | Cast a resolution vote |
| GET | `/votes/:caseId/status` | Citizen | Check if already voted |
| GET | `/users/dept-admins` | Super Admin | List all dept admin accounts |

---

*Built as a Final Year Project — Mardan, KPK, Pakistan*
