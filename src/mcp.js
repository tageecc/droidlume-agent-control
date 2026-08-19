import readline from "node:readline";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { DroidLumeClient } from "./client.js";
import { commandByName, commands } from "./schema.js";
import { ensureDroidLume } from "./runtime.js";
import { packageVersion } from "./version.js";

export async function runMCPServer(input = process.stdin, output = process.stdout) {
  const client = new DroidLumeClient();
  const lines = readline.createInterface({ input, crlfDelay: Infinity, terminal: false });
  for await (const line of lines) {
    if (!line.trim()) continue;
    let response;
    try {
      const request = JSON.parse(line);
      response = await handle(request, client);
    } catch (error) {
      response = rpcError(null, -32700, error.message);
    }
    if (response) output.write(`${JSON.stringify(response)}\n`);
  }
}

async function handle(request, client) {
  const { id = null, method, params = {} } = request;
  if (method?.startsWith("notifications/")) return null;
  switch (method) {
    case "initialize": return result(id, {
      protocolVersion: "2025-11-25",
      capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false }, prompts: { listChanged: false } },
      serverInfo: { name: "DroidLume", version: packageVersion },
      instructions: "Control local DroidLume-managed Android devices. Use stable device IDs and inspect state after mutations."
    });
    case "ping": return result(id, {});
    case "tools/list": return result(id, { tools: toolDefinitions() });
    case "tools/call": return callTool(id, params, client);
    case "resources/list": return result(id, { resources: [
      { uri: "droidlume://devices", name: "Managed Android devices", mimeType: "application/json" },
      { uri: "droidlume://schema", name: "DroidLume control schema", mimeType: "application/json" },
      { uri: "droidlume://health", name: "DroidLume runtime health", mimeType: "application/json" }
    ] });
    case "resources/read": return readResource(id, params.uri, client);
    case "prompts/list": return result(id, { prompts: [{ name: "inspect_android_app", description: "Launch an Android app, capture its screen, and report visible state.", arguments: [{ name: "deviceId", required: true }, { name: "packageName", required: true }] }] });
    case "prompts/get": return prompt(id, params);
    default: return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

async function callTool(id, params, client) {
  const command = params.name?.replaceAll("_", ".");
  const descriptor = commandByName.get(command);
  if (!descriptor || command === "system.schema") return rpcError(id, -32602, "Unknown DroidLume tool.");
  try {
    await ensureDroidLume(client);
    const args = { ...(params.arguments || {}) };
    if (command === "app.install") {
      const path = resolve(args.path || "");
      await access(path, constants.R_OK);
      delete args.path;
      args.uploadPath = await client.upload(path);
    }
    const response = await client.execute(command, args, descriptor.timeoutSeconds * 1_000);
    if (command === "device.screenshot" && response.result?.base64) {
      const { base64, ...metadata } = response.result;
      return result(id, { content: [{ type: "text", text: JSON.stringify(metadata) }, { type: "image", data: base64, mimeType: "image/png" }], structuredContent: response.result });
    }
    return result(id, { content: [{ type: "text", text: JSON.stringify(response.result ?? null) }], structuredContent: response.result ?? null });
  } catch (error) {
    return result(id, { content: [{ type: "text", text: `${error.code || "TOOL_FAILED"}: ${error.message}` }], isError: true });
  }
}

async function readResource(id, uri, client) {
  const map = { "droidlume://devices": "device.list", "droidlume://schema": "system.schema", "droidlume://health": "system.health" };
  if (!map[uri]) return rpcError(id, -32602, `Unknown resource URI: ${uri}`);
  await ensureDroidLume(client);
  const response = await client.execute(map[uri]);
  return result(id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(response.result ?? null) }] });
}

function prompt(id, params) {
  if (params.name !== "inspect_android_app") return rpcError(id, -32602, "Unknown prompt.");
  const device = params.arguments?.deviceId || "DEVICE_ID";
  const packageName = params.arguments?.packageName || "PACKAGE";
  return result(id, { description: "Inspect an Android application in DroidLume.", messages: [{ role: "user", content: { type: "text", text: `On DroidLume device ${device}, launch ${packageName}, capture a screenshot, inspect the visible state, and report the result.` } }] });
}

function toolDefinitions() {
  return commands.filter((item) => item.name !== "system.schema").map((item) => {
    const properties = {}, required = [];
    for (const parameter of item.parameters) {
      properties[parameter.name] = { type: parameter.type === "integer" ? "integer" : parameter.type === "boolean" ? "boolean" : "string", description: parameter.description, ...(parameter.allowedValues ? { enum: parameter.allowedValues } : {}) };
      if (parameter.required) required.push(parameter.name);
    }
    return { name: item.name.replaceAll(".", "_"), description: item.summary, inputSchema: { type: "object", properties, required, additionalProperties: false }, annotations: { readOnlyHint: item.risk === "read", destructiveHint: item.risk === "destructive", idempotentHint: ["system.health", "device.list", "device.get", "app.list"].includes(item.name), openWorldHint: false } };
  });
}

function result(id, value) { return { jsonrpc: "2.0", id, result: value }; }
function rpcError(id, code, message) { return { jsonrpc: "2.0", id, error: { code, message } }; }
