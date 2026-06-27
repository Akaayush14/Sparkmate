# SparkMate Project Architecture Guide

## 1. Project Overview
SparkMate is a professional cleaning services platform that connects 
clients, cleaners (staff), and administrators. It includes:
- A public-facing website with service information and booking tools
- Client portal for managing bookings, payments, and reports
- Staff portal for job management, earnings tracking, and safety
- Admin portal for operations management, staff CRM, and analytics

## 2. Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Auth**: Firebase (login, register, forgot password, email verification)

### Backend
- **Framework**: Express.js
- **Runtime**: Node.js
- **Middleware**: CORS, dotenv, Firebase Admin SDK
- **Database**: (To be implemented)

## 3. Folder Structure

### Frontend (`/frontend`)
/frontend
├── public/              # Static assets (images, icons, etc.)
├── src/
│   ├── assets/          # Project assets (fonts, images, etc.)
│   ├── components/
│   │   ├── common/      # Reusable components across all roles
│   │   ├── admin/       # Admin-specific components
│   │   ├── client/      # Client-specific components
│   │   └── staff/       # Staff-specific components
│   ├── pages/
│   │   ├── Home.jsx     # Public landing page
│   │   ├── auth/        # Login, Register, VerifyEmail, ForgotPassword
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── client/      # Client dashboard pages
│   │   └── staff/       # Staff dashboard pages
│   ├── hooks/           # Custom React hooks
│   ├── context/         # AuthContext.jsx — holds Firebase user + role
│   ├── services/        # api.js — all Express API calls go here
│   ├── utils/           # Helper functions and utilities
│   ├── routes/          # AppRoutes.jsx — public + protected routes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json

### Backend (`/backend`)
/backend
├── controllers/         # authController.js, bookingController.js
├── middleware/          # authMiddleware.js, errorMiddleware.js
├── models/              # User.js, Booking.js
├── routes/              # authRoutes.js, bookingRoutes.js
├── services/            # emailService.js, cleaningService.js
├── utils/               # Helper functions, constants
├── config/
│   ├── db.js            # Database connection
│   └── firebase.js      # Firebase Admin SDK initialization
├── app.js
├── package.json
└── .env
## 4. Authentication Architecture
We use BOTH Firebase and Express — each for different jobs.

### Firebase handles (frontend only):
- User login (email/password)
- User registration
- Forgot password / reset password
- Email verification
- Persisting auth session in the browser

### Express backend handles:
- Verifying Firebase ID token on every protected request
- Attaching user role (admin | client | staff) from our own database
- Protecting API routes based on role
- All business logic (bookings, payments, staff management)

### How they connect — step by step:
1. User logs in via Firebase on the frontend
2. Firebase returns an ID token
3. Frontend attaches token to every API request:
   `Authorization: Bearer <firebase_id_token>`
4. `authMiddleware.js` verifies the token using Firebase Admin SDK
5. If valid, fetches the user role from our database and attaches 
   it to `req.user`
6. If invalid, returns 401 Unauthorized

### Rules — Trae must follow these always:
- NEVER build a custom login/register system in Express
- NEVER store passwords in our database
- ALWAYS verify Firebase token in authMiddleware.js 
  before any protected route
- ALWAYS get the user role from our own database after 
  token verification, not from Firebase
- Firebase Admin SDK config lives in backend/config/firebase.js

## 5. Coding Rules

### Where to Put New Pages
- Public pages: `/frontend/src/pages/`
- Auth pages: `/frontend/src/pages/auth/`
- Role-specific pages: `/frontend/src/pages/{admin|client|staff}/`

### Where to Put New Components
- Reusable across all roles: `/frontend/src/components/common/`
- Admin-specific: `/frontend/src/components/admin/`
- Client-specific: `/frontend/src/components/client/`
- Staff-specific: `/frontend/src/components/staff/`

### Where to Put API Calls
- ALL API calls to Express must be made from 
  `/frontend/src/services/api.js`
- Firebase auth calls stay inside 
  `/frontend/src/context/AuthContext.jsx` only
- Do NOT make fetch/axios calls directly from components or pages

### Where to Put Reusable Logic
- Custom React hooks: `/frontend/src/hooks/`
- Pure utility functions: `/frontend/src/utils/`
- Shared auth state: `/frontend/src/context/AuthContext.jsx`

### How Routes Are Structured
- **Public routes**: /, /login, /register, /verify-email, 
  /forgot-password
- **Protected routes**: /admin, /client, /staff 
  (require Firebase auth + correct role)
- Routes defined in `/frontend/src/routes/AppRoutes.jsx` 
  using `ProtectedRoute` wrapper

## 6. Naming Conventions

### File Names
- Components and Pages: PascalCase (e.g., `Button.jsx`, 
  `AdminDashboard.jsx`)
- Hooks and Utilities: camelCase (e.g., `useAuth.js`, 
  `formatDate.js`)
- Backend files: camelCase (e.g., `authController.js`, 
  `bookingRoutes.js`)

### Component Names
- React components: PascalCase
- Component file name must match the component name exactly
- No anonymous default exports — always name your components

### Function Names
- Custom hooks: must start with "use" (e.g., `useAuth`, 
  `useBooking`)
- Utility functions: camelCase (e.g., `formatDate`, 
  `calculatePrice`)

### Component File Structure Order
Every component file must follow this order:
1. Imports
2. Constants (if any)
3. Component function
4. Export default

## 7. What NOT to Do
- ❌ Do NOT put business logic in page components
- ❌ Do NOT make API calls outside `/frontend/src/services/api.js`
- ❌ Do NOT make Firebase calls outside `AuthContext.jsx`
- ❌ Do NOT use inline styles — use Tailwind CSS classes only
- ❌ Do NOT hardcode API URLs — use `VITE_API_URL` env variable
- ❌ Do NOT store passwords in the database
- ❌ Do NOT build a login/register system in Express
- ❌ Do NOT bypass authentication or role checks
- ❌ Do NOT commit .env files to git

## 8. Current Models and Their Fields

### User (`/backend/models/User.js`)
- id
- name
- email
- firebaseUid (links our DB record to Firebase user)
- role (admin | client | staff)
- phone
- emailVerified (boolean)
- approved (boolean — for staff accounts)
- createdAt
- updatedAt

### Booking (`/backend/models/Booking.js`)
- id
- clientId
- staffId (optional)
- siteId
- address
- date
- time
- duration
- type
- price
- status (pending | assigned | in-progress | completed | cancelled)
- checklist (array of tasks)
- notes
- createdAt
- updatedAt

## 9. API Conventions
- All routes prefixed with `/api`
- Auth routes: `/api/auth`
- Booking routes: `/api/bookings`
- User routes: `/api/users`
- Standard response format:
  `{ success: true/false, data: {}, message: "" }`
- HTTP status codes:
  - 200 OK, 201 Created
  - 400 Bad Request, 401 Unauthorized
  - 403 Forbidden, 404 Not Found
  - 500 Internal Server Error

## 10. Git Conventions
- Branch naming: `feature/feature-name` or `fix/bug-name`
- Commit format: `feat:` | `fix:` | `refactor:` | `style:` | `chore:`
- Example: `feat: add booking form to client dashboard`
- Never commit directly to main

## 11. Deployment Target
- Frontend: Vercel
- Backend: Render
- Do NOT add platform config files until deployment phase
- All environment values in .env only

## 12. Environment Variables

### Frontend (`/frontend/.env`)
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

### Backend (`/backend/.env`)
PORT=5000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

## 13. When Adding a New Feature — Follow This Order
1. Add API route in `backend/routes/`
2. Add controller function in `backend/controllers/`
3. Add service function in `backend/services/`
4. Add API call in `frontend/src/services/api.js`
5. Add custom hook in `frontend/src/hooks/` if stateful
6. Build the page in `frontend/src/pages/`
7. Extract reusable UI into `frontend/src/components/`
8. Wire the route in `frontend/src/routes/AppRoutes.jsx`