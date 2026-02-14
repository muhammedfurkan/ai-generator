import { TRPCError } from "@trpc/server";
import { activityLogs } from "../../../drizzle/schema";
import { getDb } from "../../db";

type AdminDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function requireAdminDb(): Promise<AdminDb> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  return db;
}

export async function logAdminActivity(
  userId: number,
  action: string,
  entityType?: string,
  entityId?: number,
  oldValue?: unknown,
  newValue?: unknown
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(activityLogs).values({
    userId,
    action,
    entityType,
    entityId,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
  });
}
