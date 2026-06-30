import { db } from "@/lib/db";
import type { Settings } from "@/types/settings";

export const settingsRepository = {
  async find(): Promise<Partial<Settings> | null> {
    const row = await db.settings.get("default");
    if (!row) return null;
    return JSON.parse(row.data) as Partial<Settings>;
  },

  async upsert(data: Settings): Promise<void> {
    await db.settings.put({ id: "default", data: JSON.stringify(data) });
  },
};
