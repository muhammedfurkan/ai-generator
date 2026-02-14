# Nano Influencer (NanoInf)

**Project Type:** Full-stack SaaS Web Application
**Purpose:** AI-powered content generation platform (Images, Videos, Characters, Upscaling).

## Tech Stack

*   **Frontend:** React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Framer Motion.
*   **Backend:** Node.js (v22+), Express 4, tRPC 11 (Type-safe API).
*   **Database:** MySQL / TiDB (via Drizzle ORM).
*   **Storage:** AWS S3 (or compatible).
*   **Language:** TypeScript (Strict).
*   **Package Manager:** pnpm.

## Directory Structure

*   `client/`: Frontend source code.
    *   `src/pages/`: Application routes/pages.
    *   `src/components/`: Reusable UI components (shadcn/ui).
    *   `src/_core/`: Core frontend logic.
*   `server/`: Backend source code.
    *   `routers/`: tRPC routers defining the API.
    *   `_core/`: Core backend logic (Auth, DB connection, AI integration).
*   `drizzle/`: Database schema definitions and migration files.
*   `shared/`: Types and constants shared between client and server.
*   `scripts/`: Utility scripts for maintenance and testing.

## Key Commands

*   **Install Dependencies:** `pnpm install`
*   **Development Server:** `pnpm dev`
    *   Runs the backend with `tsx watch`. The backend likely handles serving the frontend or proxying in dev mode.
*   **Build Production:** `pnpm build`
    *   Builds the client via `vite build`.
    *   Bundles the server via `esbuild`.
*   **Start Production:** `pnpm start`
    *   Runs the bundled server from `dist/index.js`.
*   **Database Migrations:** `pnpm db:push`
    *   Generates and applies Drizzle migrations.
*   **Test:** `pnpm test` (Vitest).

## Development Conventions

*   **API:** All client-server communication should use **tRPC**. Define routers in `server/routers/` and consume them in the client using the tRPC hooks.
*   **Styling:** Use **Tailwind CSS** for styling. UI components should generally be based on **shadcn/ui**.
*   **Database:** Use **Drizzle ORM** for all database interactions. Schema changes require running `pnpm db:push`.
*   **Environment:** Configuration is managed via `.env` files. See `.env.example` or the Deployment Guide for required keys.
*   **Type Safety:** Maintain strict type safety across the full stack using shared Zod schemas and TypeScript interfaces.

## Key Features & integrations

*   **Auth:** Email/Password with SMTP-based email verification. Google OAuth is optional (controlled via `GOOGLE_AUTH_ENABLED` env).
    *   SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
*   **AI Services:**
    *   **Kie AI:** Video generation (Veo, Sora, Kling).
    *   **Nano Banana:** Image generation.
    *   **LLM:** Prompt enhancement.
*   **Payment/Credits:** Internal credit system for managing usage limits.

