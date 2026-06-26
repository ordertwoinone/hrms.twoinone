# Nexus HR — Enterprise HRMS (UAE)

A premium, production-grade **HR Management System** for UAE companies with
100–500 employees. Built as a secure, scalable, modular commercial SaaS.

> **Status:** Project **structure** only. No business modules are implemented
> yet — this repository establishes the architecture, shell, auth, theming, and
> conventions so each module (Employees, Attendance, Leave, Payroll, …) can be
> built one at a time on a solid foundation.

---

## Tech stack

| Layer        | Technology                                                            |
| ------------ | --------------------------------------------------------------------- |
| Framework    | Next.js 15 (App Router) · React 19 · TypeScript (strict)              |
| UI           | Tailwind CSS · shadcn/ui · Lucide Icons                               |
| Forms / data | React Hook Form · Zod · TanStack Table · TanStack Query               |
| Backend      | Next.js Server Actions · Supabase (PostgreSQL, Auth, Storage)         |
| Security     | Supabase Auth · Row Level Security · RBAC · Audit logs                |
| Deployment   | Vercel · Supabase Pro                                                 |

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your Supabase keys

# 3. (Optional) add more shadcn/ui primitives as needed
npx shadcn@latest add <component>

# 4. Run the dev server
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`,
`db:types`, `db:migrate`, `db:reset`.

---

## Architecture at a glance

- **Feature-based + clean architecture.** Routes are thin; all domain logic
  lives in isolated modules under `src/features/*`. Modules talk to each other
  only through public barrels.
- **Server-first.** Reads happen in Server Components / `queries`; writes happen
  in Server Actions wrapped by a single `createAction` helper (auth + Zod
  validation + typed results + error handling in one place).
- **Defense in depth.** UI permission gates (UX) → server guards (enforcement)
  → Postgres Row Level Security (data). The same role/permission model drives
  all three.
- **Typed end-to-end.** Strict TypeScript, no `any`; DB types are generated from
  the live schema.

---

## Folder structure — every folder explained

```
HRMS_Two-in-one/
├── public/                     # Static assets served as-is (favicons, logos)
├── supabase/                   # Database project: config, migrations, seed
│   ├── config.toml             #   Local stack + auth/storage configuration
│   ├── migrations/             #   Ordered SQL migrations (audit cols, RLS…)
│   └── seed.sql                #   Reference/seed data (roles, leave types…)
├── src/
│   ├── app/                    # Next.js App Router — ROUTING lives here only
│   │   ├── (auth)/             #   Public auth route group (no chrome)
│   │   │   ├── layout.tsx       #     Centered split-screen auth shell
│   │   │   ├── login/           #     /login
│   │   │   ├── forgot-password/ #     /forgot-password
│   │   │   └── reset-password/  #     /reset-password
│   │   ├── (dashboard)/        #   Protected app route group (sidebar+header)
│   │   │   ├── layout.tsx       #     Auth gate + premium shell + AuthProvider
│   │   │   ├── loading.tsx      #     Skeleton shown inside the shell
│   │   │   ├── error.tsx        #     Segment error boundary (nav stays intact)
│   │   │   └── dashboard/       #     /dashboard (professional landing)
│   │   ├── auth/               #   Auth infrastructure (not pages)
│   │   │   ├── callback/        #     Code→session exchange (email/OAuth)
│   │   │   └── sign-out/        #     POST sign-out → clears cookies
│   │   ├── api/health/         #   Liveness probe for monitors/LBs
│   │   ├── layout.tsx          #   Root layout: fonts + global providers
│   │   ├── globals.css         #   Design tokens (dark sidebar / white content)
│   │   ├── page.tsx            #   Root redirect (→ dashboard or login)
│   │   ├── loading.tsx         #   Top-level loading UI
│   │   ├── error.tsx           #   Top-level error boundary
│   │   ├── global-error.tsx    #   Last-resort boundary (root layout failures)
│   │   └── not-found.tsx       #   Global 404
│   │
│   ├── features/              # FEATURE MODULES — isolated business capabilities
│   │   ├── README.md           #   The canonical per-module structure + rules
│   │   ├── employees/          #   Example module scaffold (components/actions/
│   │   │                       #     queries/hooks/schemas + index/types/consts)
│   │   ├── auth/ departments/ attendance/ leave/ payroll/
│   │   └── documents/ reports/ settings/   # one folder per module (unbuilt)
│   │
│   ├── components/            # Reusable, cross-feature UI
│   │   ├── ui/                 #   shadcn/ui primitives (button, card, table…)
│   │   ├── layout/             #   App shell: sidebar, header, nav, breadcrumbs
│   │   ├── shared/             #   Cross-feature widgets (PermissionGate,
│   │   │                       #     EmptyState, PageHeader, LoadingSpinner)
│   │   ├── data-table/         #   Generic TanStack Table wrapper + pagination
│   │   └── providers/          #   Theme, Query, Auth, Tooltip, Toaster
│   │
│   ├── hooks/                 # Global client hooks (use-mobile, use-permissions…)
│   ├── lib/                   # Infrastructure & wiring (not pure helpers)
│   │   ├── supabase/           #   Clients: client, server, middleware, admin
│   │   ├── auth/               #   session (server), rbac (pure), guards (server)
│   │   ├── validations/        #   Shared Zod schemas (email, phone, query…)
│   │   ├── env.ts              #   Type-safe, validated environment variables
│   │   ├── logger.ts           #   Structured logger
│   │   └── utils.ts            #   `cn` class-name merger
│   │
│   ├── server/               # Server-only application services
│   │   ├── safe-action.ts      #   createAction(): auth+zod+errors for actions
│   │   └── audit.ts            #   recordAudit(): append-only audit logging
│   │
│   ├── config/               # Static configuration
│   │   ├── site.ts             #   Brand/site metadata
│   │   ├── navigation.ts       #   Single source of truth for the sidebar
│   │   └── roles.ts            #   Roles → permission bundles + labels
│   │
│   ├── constants/            # App-wide constants
│   │   ├── routes.ts           #   Central route map + public-route guard
│   │   ├── permissions.ts      #   Permission catalog (resource:action)
│   │   └── index.ts            #   Pagination, storage buckets, locale…
│   │
│   ├── types/                # Shared TypeScript types
│   │   ├── database.types.ts   #   GENERATED from Supabase (placeholder for now)
│   │   ├── common.ts           #   BaseEntity, ActionResult, PaginatedResult…
│   │   ├── auth.ts             #   AuthUser, AuthContextValue
│   │   └── index.ts            #   Barrel (excludes generated db types)
│   │
│   ├── utils/                # PURE helpers (no React, no I/O)
│   │   ├── format.ts           #   Currency (AED), initials, file size…
│   │   ├── date.ts             #   date-fns wrappers (Asia/Dubai formats)
│   │   └── index.ts
│   │
│   └── middleware.ts         # Edge middleware: refresh session + route guard
│
├── components.json           # shadcn/ui generator config
├── next.config.ts            # Next.js config (Server Actions, image hosts)
├── tailwind.config.ts        # Tailwind + design tokens
├── tsconfig.json             # Strict TS + `@/*` path alias
├── eslint.config.mjs         # Flat ESLint (no-explicit-any = error)
└── .env.example              # Environment variable template
```

### Why this split?

- **`app/` is routing only.** A route file imports a feature component and
  renders it. This keeps Next.js concerns (routing, layouts, boundaries)
  separate from business logic.
- **`features/` owns the domain.** Each module is self-contained and isolated,
  so it can be built, tested, and reasoned about independently — and removed
  without ripples.
- **`components/` vs `features/<m>/components/`.** Global, reusable UI lives in
  `components/`; UI that only makes sense for one module lives in that module.
- **`lib/` vs `utils/`.** `lib/` is infrastructure and wiring (Supabase clients,
  auth, env). `utils/` is pure, dependency-light functions. The separation keeps
  pure logic trivially testable.
- **`server/` is server-only services.** The action wrapper and audit logger
  are guarded by `import "server-only"` so they can never leak into the client.

---

## Routing structure

| Group         | Auth        | Purpose                                          |
| ------------- | ----------- | ------------------------------------------------ |
| `(auth)`      | Public      | Login, forgot/reset password — split-screen UI   |
| `(dashboard)` | Protected   | The application; dark sidebar + white content    |
| `auth/*`      | System      | Callback + sign-out route handlers               |
| `api/*`       | System      | Health check (extend with webhooks as needed)    |

Route groups `(auth)` / `(dashboard)` give each area its own layout without
adding URL segments. The middleware enforces the boundary on every request.

---

## Authentication & authorization

1. **Session** — Supabase Auth with cookie-based SSR (`@supabase/ssr`). The
   middleware refreshes the session on every request.
2. **Routing guard** — unauthenticated users are redirected to `/login`;
   authenticated users are bounced away from auth pages.
3. **RBAC** — roles (`super_admin` → `employee`) map to permission bundles
   (`config/roles.ts`). Modules check **permissions**, not roles.
4. **Enforcement layers**
   - UI: `<PermissionGate>` / `usePermissions` hide controls (UX only).
   - Server: `requirePermission` / `assertPermission` gate pages and actions.
   - Database: **Row Level Security** policies are the source of truth.
5. **Audit** — every state change calls `recordAudit` into an append-only table.

---

## Database conventions

Every table carries UUID PKs and the standard audit + soft-delete columns
(`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`), is
normalized, has RLS enabled, and maintains `updated_at` via a shared trigger.
See `supabase/migrations/README.md` for the full convention and migration order.

---

## Theming

Premium enterprise look: a **dark sidebar** rail against a **white content
area**, driven entirely by CSS variables in `globals.css`. Full light/dark
support via `next-themes`; the sidebar stays dark in both. Desktop-first,
responsive down to tablet and mobile (sidebar collapses into a slide-over).

---

## Building a module (next steps)

For each module, in order: add a migration (schema + RLS) → generate DB types
(`npm run db:types`) → write `schemas/` (Zod) → `queries/` (reads) → `actions/`
(writes via `createAction`) → `components/` (UI) → an `app/(dashboard)/<m>`
route that renders them → export the public surface from the module's
`index.ts`. The navigation entry and permissions already exist in `config/`.
