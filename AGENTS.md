# Repository Guidelines

## Project Structure & Module Organization

- `client/` contains the Vite + React frontend. Main app code is under `client/src/` (`pages/`, `components/`, `hooks/`, `contexts/`, `lib/`).
- `server/` contains the Express + tRPC backend (`_core/` for app bootstrap/auth/context, `routers/` for feature routes, `routes/` for webhook-style endpoints).
- `shared/` holds cross-app types/constants imported by both client and server.
- `drizzle/` stores Drizzle schema and SQL migrations; `drizzle/meta/` tracks migration snapshots.
- `scripts/` includes one-off maintenance/seed/refactor utilities. `docs/` stores operational and feature notes.

## Build, Test, and Development Commands

- `pnpm dev` runs the backend in watch mode (`server/_core/index.ts`).
- `pnpm dev:front` starts the frontend dev server (Vite).
- `pnpm build` builds client assets and bundles the server to `dist/`.
- `pnpm start` runs the production server from `dist/index.js`.
- `pnpm check` runs TypeScript type-checking with `--noEmit`.
- `pnpm test` runs Vitest tests.
- `pnpm db:push` generates and applies Drizzle migrations.
- `pnpm db:studio` opens Drizzle Studio on port `3005`.

## Coding Style & Naming Conventions

- TypeScript-first, strict mode enabled (`tsconfig.json`).
- Prettier is the formatter (`tabWidth: 2`, semicolons on, double quotes, trailing commas `es5`). Run `pnpm format`.
- Use path aliases: `@/*` for `client/src/*`, `@shared/*` for shared modules.
- Naming: React components/pages in `PascalCase` (e.g., `AdminDashboard.tsx`), hooks as `useX.ts(x)`, backend modules by feature (`videoGeneration.ts`, `promptEnhancer.ts`).

## Testing Guidelines

- Framework: Vitest (`vitest.config.ts`) with Node environment.
- Test files live in `server/` and should use `*.test.ts` or `*.spec.ts`.
- Prefer feature-focused tests near related routers/services (example: `server/routers/videoGeneration.test.ts`).
- Run `pnpm test` locally before opening a PR; use `pnpm test -- --watch` during development.

## Commit & Pull Request Guidelines

- Current git history is minimal (`v1.0 init`), so no strong legacy convention is established yet.
- Use concise, imperative commit messages, optionally scoped (e.g., `fix(auth): handle expired Clerk session`).
- Keep commits focused and atomic; avoid mixing migrations, refactors, and feature changes in one commit.
- PRs should include: purpose summary, key changes, test evidence (`pnpm test`, `pnpm check`), related issue/ticket, and UI screenshots for frontend-impacting work.

## Security & Configuration Tips

- Keep secrets in `.env` (never commit credentials). `DATABASE_URL` is required for Drizzle commands.
- Validate webhook/auth changes carefully (`server/routes/stripeWebhook.ts`, auth modules in `server/_core/`).
