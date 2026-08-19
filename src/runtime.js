import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export async function ensureDroidLume(client) {
  try { await client.health(); return; } catch {}
  spawnSync("/usr/bin/open", ["-g", "-a", "DroidLume"], { stdio: "ignore" });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await delay(300);
    try { await client.health(); return; } catch {}
  }
  const error = new Error("DroidLume did not start its local control service.");
  error.code = "APP_UNAVAILABLE";
  throw error;
}
