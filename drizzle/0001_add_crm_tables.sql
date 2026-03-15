-- Up
CREATE TABLE "clients" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "email" text,
    "phone" text,
    "organization" text,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "projects" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "status" text NOT NULL DEFAULT 'active',
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "invoices" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
    "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "amount" decimal(12,2) NOT NULL,
    "currency" text NOT NULL DEFAULT 'USD',
    "status" text NOT NULL DEFAULT 'unpaid',
    "due_date" timestamptz,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Down
DROP TABLE IF EXISTS "invoices";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "clients";