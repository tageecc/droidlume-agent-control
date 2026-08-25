import assert from "node:assert/strict";
import { test } from "node:test";
import { runCLI } from "../src/cli.js";

function capture() {
  let value = "";
  return { stream: { write(chunk) { value += chunk; } }, value: () => value };
}

test("CLI emits canonical dry-run request", async () => {
  const stdout = capture(), stderr = capture();
  process.exitCode = 0;
  await runCLI(["device", "start", "DEVICE-1", "--show", "--dry-run"], { stdout: stdout.stream, stderr: stderr.stream });
  assert.deepEqual(JSON.parse(stdout.value()), {
    dryRun: true,
    command: "device.start",
    arguments: { deviceId: "DEVICE-1", showDisplay: true }
  });
  assert.equal(stderr.value(), "");
});

test("CLI generates npm MCP configuration", async () => {
  const stdout = capture(), stderr = capture();
  await runCLI(["agent", "config"], { stdout: stdout.stream, stderr: stderr.stream });
  const config = JSON.parse(stdout.value());
  assert.equal(config.mcpServers.droidlume.command, "npx");
  assert.deepEqual(config.mcpServers.droidlume.args, ["-y", "droidlume-agent-control", "mcp"]);
});

test("CLI emits canonical snapshot request", async () => {
  const stdout = capture(), stderr = capture();
  process.exitCode = 0;
  await runCLI(["snapshot", "create", "DEVICE-1", "--name", "Before update", "--dry-run"], { stdout: stdout.stream, stderr: stderr.stream });
  assert.deepEqual(JSON.parse(stdout.value()), {
    dryRun: true,
    command: "snapshot.create",
    arguments: { deviceId: "DEVICE-1", name: "Before update" }
  });
  assert.equal(stderr.value(), "");
});
