# Eloity Platform Implementation Guide

> **Purpose**: This document consolidates everything required to take the Eloity platform from the current development snapshot to a production-ready release. It covers architecture, mandatory third-party services, environment configuration, implementation steps, file touch-points, and validation activities across the entire stack (frontend + backend).

---

## 1. Platform Overview

| Layer | Description | Key Entry Points |
|-------|-------------|------------------|
| Frontend | React 18 + Vite 7 + TypeScript + Tailwind, extensive component library under `src/components`, route definitions in `src/App.tsx`, feature pages in `src/pages/`. | `src/main.tsx`, `src/App.tsx`, `src/pages/**`, `src/components/**` |
| Backend | Express + TypeScript, modular routes/services pattern, websocket server, rate limiting, session support. | `server/enhanced-index.ts`, `server/routes/**/*.ts`, `server/services/**/*.ts`, `server/middleware/auth.ts` |
| Shared Schema | Zod + Drizzle ORM schema definitions shared between front/back. | `shared/**/*.ts`, `drizzle.config.ts`, `drizzle.comprehensive.config.ts` |
| Database | PostgreSQL (Neon/Supabase/Postgres). Migrations handled by Drizzle. | `migrations/meta/**`, `scripts/*.ts`, `apply-migrations-supabase.js` |
| Realtime | WebSockets (custom) + Supabase Realtime channels used on the client (`src/hooks/use-realtime-*.ts`). | `server/enhanced-index.ts`, `src/hooks/use-realtime-messaging.ts`, `src/hooks/use-realtime-notifications.ts` |

### 1.1 Directory Snapshot
```
/app
├── server/             # Express app, services, middleware
├── src/                # React application
│   ├── components/     # Feature-specific UI
│   ├── pages/          # Routed screens
│   ├── services/       # Client-side data/services (Supabase, REST)
│   ├── hooks/          # Custom hooks (React Query, realtime, etc.)
│   ├── contexts/       # Global state providers (Auth, Theme, Feed)
│   └── integrations/   # Supabase client + types
├── shared/             # Shared TypeScript schemas
├── migrations/         # Drizzle migration journal & snapshots
├── scripts/            # Utility scripts (admin creation, migrations)
└── docs/ + *.md        # Documentation library
```

---

## 2. Tooling & Prerequisites

1. **Runtime**: Node.js 20+ (development logs show 22.16.0).
2. **Package Managers**: `ni` (preferred) or `npm`/`pnpm`.
3. **Database**: Postgres instance (Neon recommended for managed serverless). Install `psql` for local access.
4. **Migrations**: `drizzle-kit` (invoked through npm scripts).
5. **Global Utilities**:
   - FFmpeg (video thumbnails, live streaming in `server/services/videoService.ts`).
   - Redis or compatible cache (recommended for sessions + rate limiting if scaling horizontally).
   - AWS CLI / Terraform (if automating infrastructure provisioning).

---

## 3. Environment Configuration

### 3.1 Backend `.env`

| Variable | Purpose | Referenced In |
|----------|---------|---------------|
| `NODE_ENV` | Controls dev/prod branches. | `server/enhanced-index.ts`, services |
| `PORT` | Backend HTTP port (default 5002). | `server/enhanced-index.ts` |
| `DATABASE_URL` | Postgres connection string. | `server/enhanced-index.ts`, `drizzle.config.ts` |
| `SESSION_SECRET` | Express session secret. | `server/enhanced-index.ts` |
| `JWT_SECRET` | JWT signing secret. | `server/middleware/auth.ts`, `server/enhanced-index.ts` |
| `BACKEND_URL` | Absolute URL for callbacks/webhooks. | `server/routes/payments.ts`, `server/routes/kyc.ts` |
| `FRONTEND_URL` | Used for CORS + callback redirects. | `server/enhanced-index.ts`, `server/services/paymentService.ts` |
| `LOG_LEVEL` | Winston log level. | `server/enhanced-index.ts` |
| `OTP_SALT` | OTP hashing (KYC service). | `server/services/kycService.ts` |
| `RTMP_SERVER_URL` | Live streaming RTMP endpoint. | `server/services/videoService.ts` |

### 3.2 Frontend `.env.local`

| Variable | Purpose | Referenced In |
|----------|---------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL. | `src/integrations/supabase/client.ts` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key. | `src/integrations/supabase/client.ts` |
| `VITE_BACKEND_URL` (recommended) | Base URL for REST calls (currently many services assume relative or use Supabase). | Add to API utilities like `src/lib/api.ts`, `src/lib/fetch-utils.ts` |
| Additional feature flags | Create as needed (e.g., `VITE_ENABLE_MOCKS=false`). |

**Tip**: Keep backend secrets out of the Vite build; only expose publishable keys.

---

## 4. Third-Party Services Matrix

| Domain | Service | Why It’s Needed | Required Keys / Setup |
|--------|---------|-----------------|-----------------------|
| Database & Auth | **Supabase** | Realtime channels, Postgres access, auth helpers used across `src/services/**`. | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, (optional) service role key for server-side tasks. Sign up at [supabase.com](https://supabase.com) and provision tables per Drizzle schema. |
| Postgres Hosting | **Neon** | Production-grade Postgres; alternative to Supabase-managed Postgres. | `DATABASE_URL`. Create project, enable connection pooling. |
| Payments | **Flutterwave**, **Paystack**, **MTN MoMo**, **Orange Money** | Payment flows implemented in `server/services/paymentService.ts` and `server/routes/payments.ts`. | `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_SECRET_HASH`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_BASE_URL`, `MTN_MOMO_ENVIRONMENT`, `ORANGE_MONEY_MERCHANT_KEY`, `ORANGE_MONEY_BASE_URL`, etc. Each provider requires business verification. |
| Notifications (SMS/Voice/WhatsApp) | **Termii**, **Africa's Talking**, **Twilio**, **Vonage** | Used in `server/services/notificationService.ts` for multi-channel communications. | `TERMII_API_KEY`, `AFRICAS_TALKING_API_KEY`, `AFRICAS_TALKING_USERNAME`, `AFRICAS_TALKING_VOICE_NUMBER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_VOICE_NUMBER`, `VONAGE_API_KEY`, `VONAGE_API_SECRET`. Configure sender IDs & messaging templates. |
| Email | **SendGrid** (default assumption) | Transactional emails in notification service. | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`. |
| Push Notifications | **Firebase Cloud Messaging** | Mobile/web push in notification service. | `FCM_SERVER_KEY`. Set up Firebase project and web push certificates. |
| Identity/KYC | **Smile Identity**, **Youverify**, **Veriff**, **Jumio** | KYC flows defined in `server/services/kycService.ts`, `server/routes/kyc.ts`. | `SMILE_IDENTITY_PARTNER_ID`, `SMILE_IDENTITY_API_KEY`, `YOUVERIFY_BASE_URL`, `YOUVERIFY_TOKEN`, `VERIFF_API_KEY`, `JUMIO_API_TOKEN`, `JUMIO_API_SECRET`. Obtain sandbox credentials before production. |
| Voice / USSD | **Africa's Talking** | Voice calls + USSD flows. | `AFRICAS_TALKING_USSD_CODE`, `AFRICAS_TALKING_VOICE_NUMBER`, `AFRICAS_TALKING_API_KEY`. |
| Storage | **AWS S3 / DigitalOcean Spaces** | Media uploads placeholder in `server/routes/profiles.ts` and video service. | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`. Implement upload handlers. |
| Analytics & Monitoring | **Sentry**, **Logtail**, etc. | Not wired yet; recommended for production error tracking. | Introduce `SENTRY_DSN`, `LOGTAIL_SOURCE_TOKEN` when integrated. |

> **Action**: For each provider, create sandbox/test accounts first, verify webhook URLs, and store secrets in the deployment environment (not in repo).

---

## 5. Implementation Roadmap (Step-by-Step)

### Phase 0 – Preflight
1. Clone repository and install dependencies:
   ```bash
   ni
   ```
2. Duplicate `.env.example` (create one if missing) into backend `.env` and frontend `.env.local` with placeholder values.
3. Confirm TypeScript compilation:
   ```bash
   npm run build:frontend
   npm run build:backend
   ```

### Phase 1 – Database & Schema
1. Provision Postgres (Neon or Supabase). Obtain `DATABASE_URL`.
2. Run Drizzle migrations:
   ```bash
   npm run migrate
   npm run migrate:apply
   ```
3. Seed initial data using scripts (e.g., `scripts/create-admin.ts`, `scripts/setup.ts`). Review script comments for required variables (`ADMIN_EMAIL`, etc.).
4. Configure Supabase tables to mirror Drizzle schema if Supabase is primary (import `shared/*.ts` definitions).

### Phase 2 – Authentication & Sessions
1. Decide between Supabase auth or Passport local strategy (current backend uses Passport local + sessions).
2. Ensure session store is production-ready (replace default MemoryStore in `server/enhanced-index.ts` with Redis-backed store).
3. Update `server/middleware/auth.ts` to align with chosen auth strategy and set `JWT_SECRET`.
4. Frontend: hook `src/contexts/AuthContext.tsx` to real auth endpoints (currently returns mock responses). Replace placeholders in `login`, `signup`, `logout` with actual API calls (`/api/auth/*`).

### Phase 3 – Core APIs & Services
1. Replace mock branches in services with real integrations:
   - `server/services/cryptoService.ts`: Connect to live price feeds (e.g., CoinGecko) and order book providers.
   - `server/services/paymentService.ts`: Remove mock responses when `NODE_ENV !== 'production'`; ensure webhooks defined in `server/routes/payments.ts` validate signatures.
   - `server/services/videoService.ts`: Implement media storage, FFmpeg thumbnail generation, RTMP server control.
   - `server/services/kycService.ts`: Wire to Smile Identity/Youverify/Veriff webhooks, persist verification state to database tables.
   - `server/services/notificationService.ts`: Enable providers (Termii, Twilio, etc.) and ensure rate limiting + logging.
2. Audit all routes in `server/routes/**/*.ts` for `TODO` or comments referencing mock behaviour (e.g., profile uploads). Implement persistence where indicated.
3. Update shared schemas if new tables/columns required.

### Phase 4 – Frontend Data Integration
1. Ensure `src/lib/api.ts` and `src/lib/fetch-utils.ts` point to real backend base URL.
2. Replace lingering mock data usage:
   - `src/hooks/use-stories.ts`, `src/hooks/useStories.ts` (still noting mock fallback) – point to real `stories` table or service.
   - Any component referencing placeholder arrays (search for `mock` or `TODO`).
3. Align feature pages with backend endpoints:
   - Feed (`src/hooks/useFeedPosts.ts`, `src/hooks/use-feed.ts`).
   - Marketplace (`src/services/marketplaceService.ts`, `src/pages/marketplace/**`).
   - Freelance (`src/services/freelanceService.ts`).
   - Crypto dashboards (`src/pages/ProfessionalCrypto.tsx`, `src/pages/EnhancedCrypto.tsx`).
4. Implement Supabase Realtime listeners where channels exist (posts, notifications) and confirm database triggers broadcast events.

### Phase 5 – Communications & Notifications
1. Configure messaging providers and verify templates.
2. Set up push notifications (Firebase) and connect `src/services/notificationService.ts` frontend counterpart.
3. Enable email templates and localize content (see `src/components/notifications/**`).
4. Ensure unsubscribe/manage preferences endpoints exist and are exposed in the UI.

### Phase 6 – Payments & Wallet
1. Define wallet ledger tables (check `shared/admin-schema.ts`, `shared/wallet` definitions).
2. Hook payment callbacks to wallet credit/debit logic in `server/services/walletService.ts`.
3. Implement dispute/escalation workflows where placeholders exist.
4. Add admin reconciliation tools (`src/pages/admin/AdminFinancial.tsx`).

### Phase 7 – KYC & Compliance
1. Complete KYC flow end-to-end: user submission (`src/components/kyc/**`), backend verification, webhook handling, status updates stored in `profiles`.
2. Implement fallback flows for markets where specific providers are unavailable.
3. Maintain audit logs for all identity checks.

### Phase 8 – Media & Livestreaming
1. Provision storage (S3) and update upload logic in `server/routes/profiles.ts`, `server/services/videoService.ts`.
2. Configure RTMP server (e.g., Ant Media, nginx-rtmp) and set `RTMP_SERVER_URL`.
3. Ensure `src/components/video/**` fetch actual stream URLs and watch endpoints.

### Phase 9 – Testing & QA
1. Automated tests: run `npm test`, `npm run lint`, `npm run build:frontend`, `npm run build:backend`.
2. Manual QA checklist (see Section 7).
3. Load and security testing (OWASP top 10 review, rate limiting, input validation).

### Phase 10 – Deployment & Operations
1. Split deployments if needed:
   - Backend → Render, Fly.io, or containerized (Dockerfile recommended for Node+FFmpeg).
   - Frontend → Vercel/Netlify (configure proxy to backend).
2. Configure CI/CD pipeline (GitHub Actions) to run tests + deploy.
3. Add observability: integrate Sentry, LogDNA, or equivalent; configure uptime monitoring.
4. Establish backup schedule for Postgres (Neon backups, point-in-time recovery).

---

## 6. Module Readiness Checklist

| Module | Current Status | Outstanding Tasks | Key Files |
|--------|----------------|-------------------|-----------|
| Authentication | Context returns mock user; Passport wired but needs production session store. | Hook UI to `/api/auth/*`, enable password reset, email verification. | `src/contexts/AuthContext.tsx`, `server/routes/auth.ts`, `server/middleware/auth.ts` |
| Feed & Social | Supabase queries implemented; ensure triggers + indexes exist. | Verify Supabase tables (`posts`, `post_likes`, `post_comments`, `followers`). Configure realtime replication. | `src/hooks/use-feed.ts`, `src/services/postService.ts`, `shared/schema.ts` |
| Chat & Notifications | Supabase realtime + websocket server available. | Finalize `messagingService` to use backend WS, ensure push notifications configured. | `src/chat/**`, `src/hooks/use-realtime-messaging.ts`, `server/routes/chat.ts`, `server/services/notificationService.ts` |
| Marketplace | Extensive UI + services; backend routes for products/orders. | Wire payment capture + fulfillment, inventory management, shipping integrations. | `src/pages/marketplace/**`, `server/routes/marketplace.ts`, `shared/enhanced-schema.ts` |
| Freelance | UI/services rely on Supabase tables. | Implement contract lifecycle, escrow release, milestone approvals. | `src/pages/freelance/**`, `server/routes/freelance.ts`, `server/services/freelanceService.ts` |
| Crypto & Wallet | UI expects live pricing and wallet balances. | Integrate price feeds, complete payment rails, blockchain custody, compliance reporting. | `src/pages/ProfessionalCrypto.tsx`, `src/pages/EnhancedCrypto.tsx`, `server/services/cryptoService.ts`, `server/services/walletService.ts` |
| KYC | UI present; service stubs waiting for real provider responses. | Register webhook endpoints, persist verification, implement retries. | `src/components/kyc/*`, `server/routes/kyc.ts`, `server/services/kycService.ts` |
| Video/Livestream | UI ready; service stubs. | Provision storage, RTMP, transcoding pipeline. | `src/components/video/**`, `server/services/videoService.ts` |
| Admin Console | Many dashboards assume data availability. | Ensure analytics queries are efficient, restrict access via RBAC. | `src/pages/admin/**`, `src/services/analyticsService.ts`, `server/routes/admin.ts` |

---

## 7. Validation & QA Plan

1. **Unit & Integration Tests**
   - `npm test`
   - Create additional Jest suites for critical services (payments, notifications).
2. **Type Safety**
   - `npm run build:frontend` (tsc) – fails if types inconsistent.
   - `npm run build:backend`.
3. **Linting & Formatting**
   - `npm run lint`
   - `npm run format`
4. **End-to-End Scenarios** (manual or Cypress):
   - User onboarding → KYC → Wallet funding → Marketplace purchase.
   - Creator flow → Livestream scheduling → Reward payout.
   - Freelance job lifecycle from posting to completion.
   - Chat & notifications across devices (web push, SMS fallback).
5. **Security & Compliance**
   - Verify rate limits (`express-rate-limit` config in `server/enhanced-index.ts`).
   - Pen-test authentication, payments, and file uploads.
   - Ensure GDPR/PDPA compliance (data deletion, consent tracking).
6. **Performance**
   - Load-test critical APIs (k6/Artillery).
   - Monitor Postgres query plans, add indexes as needed.

---

## 8. Deployment Guidelines

1. **Backend**
   - Build: `npm run build:backend` → outputs `dist/server/enhanced-index.js`.
   - Run with PM2 or systemd; ensure environment variables supplied.
   - Configure reverse proxy (NGINX) terminating TLS, forwarding `/api` & `/ws`.
2. **Frontend**
   - Build: `npm run build:frontend`.
   - Deploy `dist/` to CDN/hosting (Vercel, Netlify, CloudFront).
   - Set `VITE_*` vars in hosting platform.
3. **DevOps**
   - CI pipeline to lint, test, build before deployment.
   - Automated migrations via `npm run migrate:apply` with idempotent scripts.
4. **Monitoring**
   - Add health checks: `/api/health` already exposed.
   - Instrument with Sentry/NewRelic (add middleware + env keys).
   - Log aggregation using Winston transports (config in `server/enhanced-index.ts`).
5. **Backup & DR**
   - Enable automated DB backups (Neon PITR).
   - Store Supabase storage (if used) snapshots.
   - Document restore process in runbooks.

---

## 9. Operations & Onboarding Checklist

1. **Team Onboarding**
   - Share this guide, architecture diagrams, and access credentials via secure vault.
   - Provide local setup script (bash) to export env vars.
2. **Documentation**
   - Keep `docs/` folder updated for each subsystem (chat, realtime, payments).
   - Maintain API reference in `docs/api/api-reference.md` (sync with backend routes).
3. **Support & Incident Response**
   - Define escalation matrix, create Slack/Teams channels.
   - Set up on-call rotation once in production.
4. **User Onboarding**
   - Prepare KYC instructions, payment method availability chart per region.
   - Create help center articles referencing actual UI flows.

---

## 10. Quick Reference – File Hotspots

| Feature | Files to Review/Update |
|---------|------------------------|
| Global Layout & Routing | `src/App.tsx`, `src/layout/**`, `src/components/layout/**` |
| Auth UI | `src/components/auth/**`, `src/pages/Auth.tsx`, `src/contexts/AuthContext.tsx` |
| Feed | `src/components/feed/**`, `src/hooks/use-feed.ts`, `src/services/postService.ts` |
| Chat | `src/chat/**`, `src/services/messagingService.ts`, `server/routes/chat.ts` |
| Marketplace | `src/pages/marketplace/**`, `src/services/marketplaceService.ts`, `server/routes/marketplace.ts` |
| Freelance | `src/pages/freelance/**`, `src/services/freelanceService.ts`, `server/routes/freelance.ts` |
| Crypto | `src/pages/ProfessionalCrypto.tsx`, `src/pages/EnhancedCrypto.tsx`, `server/routes/crypto.ts`, `server/services/cryptoService.ts` |
| Wallet | `src/pages/wallet/**`, `server/routes/wallet.ts`, `server/services/walletService.ts` |
| Notifications | `src/components/notifications/**`, `server/services/notificationService.ts` |
| Video | `src/components/video/**`, `server/services/videoService.ts` |
| Admin Dashboards | `src/pages/admin/**`, `server/routes/admin.ts`, `src/services/analyticsService.ts` |

---

## 11. Next Steps Summary

1. Configure all environment variables listed in Section 3.
2. Sign up for each third-party service in Section 4; obtain sandbox credentials.
3. Replace mock logic in the services noted in Sections 5 & 6.
4. Populate database via migrations + seeders; validate Supabase realtime channels.
5. Complete testing matrix (Section 7) before go-live.
6. Establish deployment + monitoring pipeline (Section 8).
7. Document operational runbooks and support processes (Section 9).

Once these steps are completed the Eloity platform will be ready for production deployment and user onboarding with full feature coverage across social, marketplace, crypto, freelance, and communications modules.
