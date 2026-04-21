# City Transparency Report

## Introduction

In everyday life, citizens constantly encounter public issues such as broken roads, poor sanitation, and water shortages. While many people recognize these problems, they often remain unresolved. This reflects the **"Someone Paradox"** — everyone assumes someone else will take action.

This project shifts citizens from passive observers to active participants, enabling the people of Mardan to not only report issues but also collaborate and verify their resolution.

---

## Problem Perspective (Public View)

From a citizen's point of view, getting issues resolved is challenging due to:

- **Limited Voice in Outcomes** — Citizens can report problems, but they are not involved in confirming whether the issue is truly resolved
- **Isolation of Individuals** — People facing the same issue remain disconnected, reducing the chances of collective action
- **Lack of Trust and Clarity** — There is no reliable way for citizens to verify whether the reported work has actually been completed

These challenges reduce public confidence and slow down real progress.

---

## Proposed Solution

A community-driven civic accountability web application that empowers citizens to collaborate, track progress, and validate outcomes of public issues.

Instead of relying solely on authorities, the platform ensures that citizens collectively decide when a problem is truly solved.

### Core Innovation: Community Mandate Voting

- Citizens who reported or joined a case can vote on its resolution
- A case is marked **Resolved** only when ≥75% of citizens agree
- If the threshold is not met, the case becomes **Disputed**
- Disputed cases remain visible as public records, ensuring transparency

This transforms citizens from passive reporters into decision-makers, directly addressing the trust gap.

---

## Key Features

### 1. Citizen Collaboration
- Report issues or join existing ones
- Connect with others facing the same problem
- Build collective momentum

### 2. Transparent Case Tracking
- Track each case from reporting to resolution
- View real-time updates and progress

### 3. Proof-Based Updates
- Authorities provide evidence (images, documents) of work done
- Citizens can review and assess authenticity

### 4. Community Voting System
- Citizens vote to accept or reject resolution
- Live progress bar shows approval vs rejection

### 5. Public Transparency Feed
- All cases are publicly visible
- Sorted by engagement and urgency
- Encourages awareness and participation

### 6. Anonymous Reporting
- Allows citizens to report issues without revealing identity
- Increases participation and safety

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
│       ├── initiatives/       # Civic crowdfunding — create, donate, proof, satisfaction
│       ├── users/             # User management, dept admin listing
│       ├── cities/            # City lookup (public)
│       ├── departments/       # Department lookup by city (public)
│       ├── complaint-types/   # Complaint type lookup by department (public)
│       └── database/
│           ├── schemas/       # Mongoose schemas: User, MasterCase, UserReport, Vote, Initiative, Donation, SatisfactionVote, City, Department, ComplaintType
│           └── seeder.service.ts  # Idempotent DB seeder (runs once on bootstrap)
│
└── frontend/
    └── src/
        ├── api/               # Axios API modules per domain
        ├── components/
        │   ├── cases/         # ComplaintCard, VoteModal, JoinCaseModal, SubmitComplaintFAB
        │   ├── initiatives/   # InitiativeCard, CreateInitiativeModal, PostProofModal
        │   └── layout/        # CitizenLayout, DeptAdminLayout, SuperAdminLayout
        ├── pages/
        │   ├── auth/          # LoginPage, RegisterPage
        │   ├── citizen/       # CitizenDashboard (feed + my submissions + initiatives)
        │   ├── dept-admin/    # DeptAdminDashboard (cases + initiatives management)
        │   └── super-admin/   # SuperAdminDashboard (create dept admins)
        ├── routes/            # ProtectedRoute (role-based guard)
        └── store/             # Zustand auth store
```

---

## Software Engineering Principles Applied

### Separation of Concerns
Controller → Service → Schema. Controllers only handle HTTP I/O. Services contain all business logic. Schemas define data shape. No business logic leaks into controllers or schemas.

### Single Responsibility Principle
Each NestJS service has one job. `VotesService` handles voting and recalculation. `CasesService` handles complaint lifecycle. `InitiativesService` handles civic crowdfunding. They do not cross-call except through explicit module imports.

### DRY (Don't Repeat Yourself)
- `findOrCreate` pattern prevents duplicate case creation across the codebase
- Layout components are reused across pages — no copy-pasted sidebars
- Shared `StatusBadge` component renders consistently in both citizen and dept-admin views

### Role-Based Access Control (RBAC)
Three roles with strictly enforced boundaries. The `@Roles()` decorator + `RolesGuard` on the backend, and `ProtectedRoute` on the frontend, ensure no role can access another's resources.

### Fail-Safe Defaults
- Votes cannot be cast twice (DB-level unique index + application-level check)
- Cases cannot be resolved prematurely — all reporters must vote
- Disputed cases cannot be deleted — permanent public records
- JWT expiry is enforced; expired tokens trigger automatic logout

### Idempotent Seeding
The `SeederService` checks for existing data before inserting. Re-running the server never duplicates seed data.

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

On first start, the seeder automatically creates Mardan city, 8 departments, all complaint types, and a Super Admin account.

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

*Final Year Project — Mardan, KPK, Pakistan*
