# SmartStay Frontend

Minimal React + Vite + TypeScript app demonstrating role-based routing for four roles:

- Admin
- Hotel Manager
- Hotel Staff
- Customer

It uses react-router v6 and a small Zustand store for demo authentication.

## Run locally

### Prerequisites
- Node.js (v16 or higher)
- Backend API running on `https://localhost:7168`

### Setup

1. Install dependencies
2. (Optional) Copy `.env.example` to `.env` if you need custom configuration
3. Start dev server

```powershell
npm install
npm run dev
```

Then open the URL shown (usually http://localhost:5173).

**Note:** Make sure the ASP.NET Core backend API is running on port 7168 with CORS enabled for `http://localhost:5173`, `http://localhost:5174`, and `http://localhost:5175`.

## Structure

- `src/store.ts` simple auth store with name + role, persisted in localStorage
- `src/components/ProtectedRoute.tsx` gate routes by allowed roles
- `src/pages/*` example dashboards and login page
- `src/App.tsx` routes setup

## Notes

- This is a frontend-only demo. Replace the login flow with real API calls and JWT/Session handling in production. Map your backend roles to the Role union in `src/types.ts` and adjust guards accordingly.
