import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillEntries = ["SKILL.md", "agents", "references"];

export async function installSkill(target = "all", home = process.env.HOME) {
  const destinations = {
    codex: resolve(home, ".codex/skills/droidlume-control"),
    claude: resolve(home, ".claude/skills/droidlume-control"),
    cursor: resolve(home, ".cursor/skills/droidlume-control"),
    agents: resolve(home, ".agents/skills/droidlume-control")
  };
  const selected = target === "all" ? Object.entries(destinations) : [[target, destinations[target]]];
  if (!selected[0]?.[1]) throw Object.assign(new Error(`Unsupported Skill target: ${target}`), { code: "INVALID_TARGET" });
  const installed = [];
  for (const [, destination] of selected) {
    const staging = `${destination}.${process.pid}.staging`;
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    for (const entry of skillEntries) await cp(resolve(packageRoot, entry), resolve(staging, entry), { recursive: true });
    await rm(destination, { recursive: true, force: true });
    await mkdir(dirname(destination), { recursive: true });
    await cp(staging, destination, { recursive: true });
    await rm(staging, { recursive: true, force: true });
    installed.push(destination);
  }
  return installed;
}
