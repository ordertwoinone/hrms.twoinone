# Database migrations

SQL migrations are applied in filename order. Create one with:

```bash
supabase migration new <name>
```

## Conventions (enforced for every table)

Each domain table MUST include the audit + soft-delete columns from the brief:

```sql
id          uuid primary key default gen_random_uuid(),
created_at  timestamptz not null default now(),
updated_at  timestamptz not null default now(),
deleted_at  timestamptz,                       -- soft delete (null = active)
created_by  uuid references auth.users (id),
updated_by  uuid references auth.users (id)
```

- **UUID primary keys** everywhere (`gen_random_uuid()`).
- **Normalized** schema; relationships via foreign keys.
- **`updated_at`** maintained by a shared `set_updated_at()` trigger.
- **Soft delete** via `deleted_at`; queries filter `deleted_at is null`.
- **Row Level Security** enabled on every table, with policies derived from the
  role/permission model in `src/config/roles.ts` and
  `src/constants/permissions.ts`.
- **Audit logging** to an append-only `audit_logs` table (read-restricted to
  the `audit:view` permission).

## Suggested migration order

1. `0000_extensions` — enable `pgcrypto`, etc.
2. `0001_shared` — `set_updated_at()` trigger fn, enums, `audit_logs`.
3. `0002_auth_profiles` — `profiles`, `roles`, `role_permissions`, RLS helpers.
4. `0003_departments`
5. `0004_employees`
6. `0005_attendance`
7. `0006_leave`
8. `0007_payroll`
9. `0008_documents` — + Storage buckets/policies.

Migrations are added as each module is built — none are committed yet.
