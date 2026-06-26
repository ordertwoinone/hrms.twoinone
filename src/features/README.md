# Features (modules)

Each business capability is an **isolated, self-contained module** under
`src/features/<module>`. Modules never import from each other's internals — only
from `@/components`, `@/lib`, `@/hooks`, `@/types`, `@/constants`, `@/config`,
and (when a genuine cross-module need exists) another module's **public barrel**
(`features/<module>/index.ts`). This keeps modules swappable and independently
testable.

The app router (`src/app/**`) stays thin: a route file imports a feature's
page-level component and renders it. All domain logic lives in the feature.

## Canonical module structure

```
features/<module>/
├── components/        # Feature-specific UI (tables, forms, cards, dialogs)
│   └── ...
├── actions/           # Server Actions ("use server") — writes & mutations
│   └── ...            #   built with createAction() from @/server/safe-action
├── queries/           # Server-side data reads (Server Components / loaders)
│   └── ...
├── hooks/             # Client hooks (TanStack Query wrappers, local state)
│   └── ...
├── schemas/           # Zod schemas (form + action input validation)
│   └── ...
├── types.ts           # Module-local types (Row/Insert/Update derived types)
├── constants.ts       # Module-local constants (statuses, enums, labels)
└── index.ts           # PUBLIC barrel — the only entry other modules may use
```

Not every module needs every folder — add a folder when it earns its place.

## Rules

1. **Isolation** — no deep imports across modules. Cross-module access goes
   through `index.ts` only.
2. **Server-first** — reads in `queries/` (Server Components), writes in
   `actions/` (Server Actions). Client components are used only when
   interactivity demands it.
3. **Validated boundaries** — every Server Action validates input with a Zod
   schema from `schemas/` via `createAction`.
4. **Authorized** — actions/queries assert permissions (`@/lib/auth/guards`);
   the database enforces the same rules with RLS.
5. **Audited** — state changes call `recordAudit` (`@/server/audit`).

## Planned modules

`auth` · `employees` · `departments` · `attendance` · `leave` · `payroll` ·
`documents` · `reports` · `settings`

Each is scaffolded as an empty folder now and implemented one at a time later.
```
```
