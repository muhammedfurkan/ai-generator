# NanoInf AI Coding Instructions

## Project Overview

Full-stack SaaS platform for AI-powered image and video generation with credit-based economy. React 19 + TypeScript frontend, Express + tRPC backend, MySQL/TiDB database with Drizzle ORM.

## Architecture

### Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, shadcn/ui, Wouter (routing), tRPC client
- **Backend**: Express 4, tRPC 11 (end-to-end type safety), Manus OAuth
- **Database**: MySQL/TiDB with Drizzle ORM (`drizzle/schema.ts`)
- **Storage**: AWS S3 via `server/storage.ts`
- **External APIs**: Nano Banana Pro (image), Kie AI (video - Veo 3.1, Sora 2, Kling, Grok)

### Key Directories

- `server/_core/` - Core infrastructure (Express setup, tRPC, OAuth, context)
- `server/routers/` - tRPC route handlers (generation, video, admin, user, etc.)
- `client/src/pages/` - Page components mapped by Wouter
- `drizzle/` - Database schema and migrations
- `shared/` - Shared constants and types between client/server

## Development Patterns

### tRPC Routes

All API endpoints are defined as tRPC procedures in `server/routers/`:

```typescript
// Use publicProcedure for unauthenticated, protectedProcedure for auth required
export const myRouter = router({
  myEndpoint: protectedProcedure
    .input(z.object({ ... }))
    .query(async ({ ctx, input }) => {
      // ctx.user is guaranteed on protectedProcedure
      const db = await getDb();
      return await db.select()...;
    }),
});
```

Import and register routers in `server/routers.ts` under `appRouter`.

### Database Access

Always use `getDb()` for lazy connection and null-check:

```typescript
const db = await getDb();
if (!db) {
  console.warn("[Module] Database not available");
  return undefined;
}
```

Database operations use Drizzle ORM syntax with `eq()`, `and()`, `desc()` from `drizzle-orm`.

### Credit System

- Credits are central to business logic (see `users.credits` in schema)
- **ALWAYS** deduct credits BEFORE making external API calls to prevent loss on API failures
- Use `deductCredits(userId, amount)` then check returned boolean
- On failure, use `refundCredits(userId, amount, reason)` to return credits
- Record all transactions via `recordCreditTransaction()` for audit trail

### Background Processing

Video/image generation happens asynchronously:

1. Create database record with `status: "pending"`
2. Return immediately to client
3. Background job (`videoStatusUpdater.ts`) polls external APIs every 30s
4. Updates database and creates notifications on completion/failure
5. See `processImageInBackground()` in `server/routers/generation.ts` for pattern

### External API Integration

- Nano Banana Pro: Image generation (`server/nanoBananaApi.ts`)
- Kie AI: Video generation and upscaling (`server/kieAiApi.ts`)
- Always upload reference images to Kie storage first via `uploadToKieFromUrl()`
- Credit costs defined in constants (e.g., `VIDEO_MODEL_PRICING`, `QWEN_CREDIT_COSTS`)

### Telegram Bot

Admin commands via `server/telegramBot.ts`:

- `/addcredit <email> <amount>` - Add user credits
- `/broadcast <message>` - Send notification to all users
- Bot runs as background service started in `server/_core/index.ts`

## Development Workflows

### Running the App

```bash
npm run dev        # Development with hot reload (tsx watch)
npm run build      # Production build (Vite + esbuild)
npm run start      # Start production server
npm run check      # TypeScript check
npm run test       # Run Vitest tests
npm run db:push    # Generate and run DB migrations
```

### Testing

Tests use Vitest (config: `vitest.config.ts`). Pattern:

- Place tests alongside code: `server/routers/generation.test.ts`
- Mock database with test contexts: `createPublicContext()`, `createProtectedContext()`
- Test coverage includes routers, API integrations, credit calculations

### Database Migrations

1. Modify `drizzle/schema.ts`
2. Run `npm run db:push` to generate migration in `drizzle/`
3. Drizzle auto-applies migrations on next `getDb()` call
4. New users get 25 credits by default (see `upsertUser()`)

### File Uploads

Reference images via multipart form upload to `/api/upload`:

- Endpoint in `server/_core/index.ts` uses busboy for parsing
- Uploads to S3 with key pattern: `{userId}/references/{nanoid}-{filename}`
- Returns S3 URL for use in generation requests

## Project-Specific Conventions

### Error Handling

- Client auto-redirects to login on `UNAUTHED_ERR_MSG` (see `client/src/main.tsx`)
- Console logs prefixed with module name: `[Nano Banana API]`, `[Database]`, etc.
- API timeouts set to 600s for long-running operations

### Type Safety

- Shared constants in `shared/const.ts` imported by both client/server
- Database types inferred from schema: `User`, `GeneratedImage`, etc.
- tRPC ensures end-to-end type safety from DB → API → Client

### Deployment

- Runs on Manus hosting or custom VPS (see `DEPLOYMENT_GUIDE.md`)
- PM2 for process management (config: `ecosystem.config.cjs`)
- Environment variables in `.env` (never commit this file)
- Uses TiDB Cloud for production database

### Naming Conventions

- Database tables: camelCase (`generatedImages`, `videoGenerations`)
- Components: PascalCase (`Generate.tsx`, `VideoGenerate.tsx`)
- tRPC procedures: camelCase (`getUserGeneratedImages`, `createVideoGeneration`)
- API modules: camelCase with descriptive names (`nanoBananaApi.ts`, `kieAiApi.ts`)

## Critical Gotchas

1. **Credit Deduction Timing**: ALWAYS deduct before API calls, never after
2. **Database Availability**: Always null-check `getDb()` result - local tooling may run without DB
3. **Background Jobs**: Video/image status updates happen async - don't poll from client
4. **API Key Management**: Keys stored in env vars, checked at runtime with fallback errors
5. **File Upload Flow**: S3 direct upload → store URL in DB → pass URL to AI APIs
6. **Session Management**: Cookie-based auth via `COOKIE_NAME` from `@shared/const`

## Common Tasks

### Add New Generation Feature

1. Update `drizzle/schema.ts` with new table
2. Add router in `server/routers/yourFeature.ts`
3. Register in `server/routers.ts`
4. Create page in `client/src/pages/YourFeature.tsx`
5. Update route in `client/src/App.tsx`

### Modify Credit Costs

Edit pricing constants in relevant files:

- Images: `server/routers/generation.ts` → `QWEN_CREDIT_COSTS`, `NANO_BANANA_PRO_CREDIT_COSTS`
- Videos: `server/kieAiApi.ts` → `VIDEO_MODEL_PRICING`
- Upscale: `server/kieAiApi.ts` → `calculateUpscaleCreditCost()`

### Debug API Integration Issues

1. Check console logs with `[Module Name]` prefix
2. Verify API keys in `.env`
3. Test API directly in `*.test.ts` files
4. Check `errorMessage` field in database records
5. Monitor background job logs: `pm2 log 0`

## Resources

- Project docs: `AI-REBUILD-PROMPT.md`, `DEPLOYMENT_GUIDE.md`
- API integrations: `kie-ai-api-notes.md`, `topaz-api-notes.md`
- Migration history: `MIGRATION_SUCCESS_REPORT.md`, `QA-FINDINGS.md`
