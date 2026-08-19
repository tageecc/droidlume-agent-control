#!/usr/bin/env node
import { runCLI } from "../src/cli.js";
import { runMCPServer } from "../src/mcp.js";
import { installSkill } from "../src/install-skill.js";

const [mode, ...args] = process.argv.slice(2);
if (mode === "mcp") {
  await runMCPServer();
} else if (mode === "install-skill") {
  for (const path of await installSkill(args[0] || "all")) console.log(`Installed Skill: ${path}`);
} else {
  await runCLI(mode ? [mode, ...args] : []);
}
