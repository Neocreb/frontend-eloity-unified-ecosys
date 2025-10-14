# Implementation Guide — Full App Handover

This document lists the concrete, prioritized work to convert the current codebase (frontend + admin UIs) into a fully functional production app backed by real services (no placeholders/localStorage). It's written so a developer or an automated agent can follow it step-by-step.

---

## Summary

Goals:
- Replace local mocks/localStorage with real backend services (recommended: Supabase)
- Wire admin UIs to real APIs and auth
- Implement database migrations and seed data
- Add unit and e2e tests for critical flows (chat, admin, auth)
- Improve accessibility, keyboard and mobile UX
- Prepare CI/CD and deployment (Netlify/Vercel) and runtime monitoring (Sentry)

Available MCP Integrations (recommended to connect via the Builder.io MCP popover):
- Supabase — preferred for database, auth, and realtime subscriptions. Connect via [Open MCP popover](#open-mcp-popover). (RECOMMENDED)
- Neon — alternative serverless Postgres option. [Connect to Neon](#open-mcp-popover)


> Note: When you are ready to wire the database, connect Supabase first via the MCP popover.

---

## High-level Steps (ordered)

1. Connect required MCPs (Supabase)
2. Provision database & auth (Supabase): create tables and run migrations
3. Implement backend endpoints for ads, chat moderation, and admin operations (if not already)
4. Wire admin UIs to real endpoints; replace localStorage usage (chat ads) with server calls
5. Add server-side validation and RBAC for admin routes
6. Add unit tests, integration tests, E2E tests (Cypress or Playwright)
7. Accessibility and UX pass (keyboard nav, labels, focus, contrast)
8. CI pipeline with lint, typecheck, tests, and deploy preview
9. Deploy to Netlify/Vercel and connect Sentry for monitoring

---

## Concrete Implementation Tasks

### 1) Backend & Database (Supabase recommended)
- Connect Supabase using MCP popover.
- Create tables (minimal set): users, chats, messages, threads, ads, admin_users, reports, audits.
- Schema mapping suggestions (example columns):
  - ads: id (pk), sponsor, title, body, image_url, cta_label, cta_url, created_at, updated_at, is_active
  - messages: id, thread_id, sender_id, content, metadata (json), created_at, updated_at, moderation_status, report_count
  - threads: id, is_group, title, participants(json)
- Add indexes on thread_id, created_at for fast retrieval.
- Add migrations folder (prefer standard migration tooling or Supabase SQL migration files).

### 2) Server endpoints and auth
- If using the existing server folder, add routes for:
  - GET /admin/ads - list ads
  - POST /admin/ads - create ad (admin-only)
  - PUT /admin/ads/:id - update ad (admin-only)
  - DELETE /admin/ads/:id - delete ad (admin-only)
  - GET /admin/flagged-messages - list flagged messages
  - POST /admin/moderate - moderate message
- Protect routes with admin auth middleware (server/middleware/auth.ts exists). Ensure tokens are validated.
- Implement API responses in the same shape used by AdminService (check src/services/adminService.ts for expected payload shapes).

### 3) Frontend wiring
- Replace localStorage-based chatAdsService with server-backed calls in src/services/chatAdsService.ts. Provide both client and admin endpoints for CRUD operations.
- Update AdminChat.tsx to call the API endpoints (AdminService or a new AdsService) and show server errors gracefully.
- Ensure optimistic UI updates only when appropriate and revert on failure.

Files to update (examples):
- src/services/chatAdsService.ts (replace get/save with fetch to /admin/ads)
- src/pages/admin/AdminChat.tsx (already includes Ads UI; wire to server)
- src/chat/ChatRoom.tsx (already reads chatAdsService.getAdsForThread; ensure it uses server-backed service)

### 4) RBAC and Admin UX
- Enforce admin role checks in both frontend (hasPermission) and server middleware.
- Ensure AdminSidebar items reflect permissions (already present).

### 5) Tests
- Unit tests for chatAdsService, AdminChat components (Jest + React Testing Library)
- Integration/E2E tests for admin flows: create/edit/delete ad, moderate message
- Add test fixtures for Supabase via test DB or mocked endpoints

### 6) Accessibility and UX polish (applies across the platform)
- Ensure all inputs have associated <label for=> and unique id (done in AdminChat ads form)
- Add aria-describedby for helper text and error states
- Provide clear focus states (outline or focus ring) for keyboard users
- Ensure interactive elements have accessible names (aria-label or text)
- Use semantic HTML (forms, buttons, table headers with scope)
- Add aria-live regions for notifications or status updates
- Ensure color contrast meets WCAG AA (adjust Tailwind color utilities where needed)
- Keyboard shortcuts: ensure Escape dismisses modals; Enter submits forms; Tab order logical

### 7) Documentation & Handover
- Maintain migration SQL and deployment steps in repo (e.g., supabase/migrations)
- Create a README for deployment and an ENV list: SUPABASE_URL, SUPABASE_KEY, SENTRY_DSN, NETLIFY_TOKEN, etc.
- Create a checklist of manual steps required to bring the app to production (seeding, admin creation, cron jobs)

---

## Developer Checklist (step-by-step)
1. [ ] Connect Supabase via MCP popover.
2. [ ] Create DB schema and run migrations: use scripts/create-tables-supabase.js as a starting point.
3. [ ] Implement server endpoints and map to AdminService client calls.
4. [ ] Replace chatAdsService localStorage persistence with API-backed implementation and update AdminChat.tsx to use it.
5. [ ] Add backend validation & RBAC.
6. [ ] Add unit tests and e2e tests.
7. [ ] Run accessibility audit (axe or Lighthouse) and fix issues.
8. [ ] Add CI pipeline: install node deps, run typecheck, tests, build.
9. [ ] Deploy to Netlify or Vercel and monitor with Sentry.

---

## Prioritized Files & Areas to Review (quick map)
- Frontend Admin: src/pages/admin/* (AdminChat.tsx, AdminDeFi.tsx, AdminGiftCards.tsx...)
- Chat: src/chat/*, src/components/chat/*, src/services/chatAdsService.ts
- Services: src/services/adminService.ts, src/services/chatAdsService.ts
- Server: server/routes/*, server/middleware/auth.ts
- Migrations: supabase/, migrations/
- Docs: README.md, NEXT_STEPS.md, REAL_SERVICES_IMPLEMENTATION.md

---

## Handover Notes for an AI Agent or Developer
- Priority 1: Database connectivity (Supabase) and API endpoints for Ads and Moderation.
- Priority 2: Secure admin routes and wire the Admin UI to the backend.
- Priority 3: Tests and accessibility fixes across the platform.
- Provide clear error handling and logs (use /server/utils/logger.ts).
- Use existing scripts in /scripts to create default admin/users and run migrations.

---

If you want, I can now:
- Wire the chat ads Admin UI to a Supabase-backed API after you connect Supabase
- Add unit and e2e tests for the admin ads flow now
- Run an accessibility audit across the codebase and create a prioritized fix list

