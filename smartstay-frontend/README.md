# SmartStay Frontend

Minimal React + Vite + TypeScript app demonstrating role-based routing for four roles:

- Admin
- Hotel Manager
- Hotel Staff
- Customer

It uses react-router v6 and a small Zustand store for demo authentication.

## Run locally

1. Install dependencies
2. Start dev server

```powershell
npm install
npm run dev
```

Then open the URL shown (usually http://localhost:5173).

## Structure

- `src/store.ts` simple auth store with name + role, persisted in localStorage
- `src/components/ProtectedRoute.tsx` gate routes by allowed roles
- `src/pages/*` example dashboards and login page
- `src/App.tsx` routes setup

## Notes

- This is a frontend-only demo. Replace the login flow with real API calls and JWT/Session handling in production. Map your backend roles to the Role union in `src/types.ts` and adjust guards accordingly.
