import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { runMCPServer } from "../src/mcp.js";

async function exchange(request) {
  const input = new PassThrough(), output = new PassThrough();
  let text = "";
  output.on("data", (chunk) => { text += chunk; });
  const running = runMCPServer(input, output);
  input.end(`${JSON.stringify(request)}\n`);
  await running;
  return JSON.parse(text);
}

test("MCP initializes with tools capability", async () => {
  const response = await exchange({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  assert.equal(response.result.serverInfo.name, "DroidLume");
  assert.equal(response.result.capabilities.tools.listChanged, false);
});

test("MCP publishes typed DroidLume tools", async () => {
  const response = await exchange({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const install = response.result.tools.find((tool) => tool.name === "app_install");
  assert.equal(install.inputSchema.properties.path.type, "string");
  assert.ok(install.inputSchema.required.includes("path"));
  const snapshot = response.result.tools.find((tool) => tool.name === "snapshot_restore");
  assert.deepEqual(snapshot.inputSchema.required, ["deviceId", "snapshotId"]);
  assert.equal(snapshot.annotations.destructiveHint, true);
});
