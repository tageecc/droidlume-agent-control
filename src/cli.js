import { access, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { DroidLumeClient } from "./client.js";
import { commandByName, commands, controlApiVersion } from "./schema.js";
import { ensureDroidLume } from "./runtime.js";
import { installSkill } from "./install-skill.js";
import { packageVersion } from "./version.js";

const aliases = {
  model: "modelName", cpu: "cpuCores", memory: "memoryGB", fps: "maxFPS",
  storage: "storageGB", phone: "phoneNumber", operator: "operatorName", duration: "durationMs",
  "front-camera": "frontCameraSource", "back-camera": "backCameraSource"
};
const integerKeys = new Set(["cpuCores", "memoryGB", "width", "height", "dpi", "maxFPS", "storageGB", "x", "y", "x1", "y1", "x2", "y2", "durationMs"]);

export async function runCLI(argv, io = { stdout: process.stdout, stderr: process.stderr }) {
  try {
    const invocation = parse(argv);
    if (!invocation.path.length || invocation.flags.has("help") || invocation.path[0] === "help") {
      io.stdout.write(help); return;
    }
    if (invocation.path[0] === "version") {
      io.stdout.write(`droidlume-agent-control ${packageVersion} (control API ${controlApiVersion})\n`); return;
    }
    if (invocation.path[0] === "schema") {
      const name = invocation.path.slice(1).join(".");
      const value = name ? commandByName.get(name) : commands;
      if (!value) throw coded("UNKNOWN_COMMAND", `Unknown DroidLume command: ${name}`);
      print(io.stdout, value, true); return;
    }
    if (invocation.path.join(" ") === "agent config") {
      print(io.stdout, { mcpServers: { droidlume: { command: "npx", args: ["-y", "droidlume-agent-control", "mcp"] } } }, true);
      return;
    }
    if (invocation.path.slice(0, 2).join(" ") === "agent install") {
      const target = invocation.path[2] || "all";
      for (const path of await installSkill(target)) io.stdout.write(`Installed Skill: ${path}\n`);
      return;
    }

    const resolved = await resolveCommand(invocation);
    if (invocation.flags.has("dry-run")) {
      print(io.stdout, { dryRun: true, command: resolved.command, arguments: resolved.args }, true); return;
    }
    const client = new DroidLumeClient();
    await ensureDroidLume(client);
    if (resolved.upload) resolved.args.uploadPath = await client.upload(resolved.upload);
    const descriptor = commandByName.get(resolved.command);
    const timeout = Number(invocation.options.timeout || descriptor?.timeoutSeconds || 30) * 1_000;
    const response = await client.execute(resolved.command, resolved.args, timeout);
    if (resolved.command === "device.screenshot") {
      const { base64, ...metadata } = response.result || {};
      if (!base64) throw coded("INVALID_SCREENSHOT", "DroidLume returned invalid screenshot data.");
      const output = resolve(invocation.options.output || "droidlume-screenshot.png");
      await writeFile(output, Buffer.from(base64, "base64"));
      print(io.stdout, { ...metadata, path: output }, true);
    } else {
      print(io.stdout, response.result ?? null, invocation.options.format === "pretty");
    }
  } catch (error) {
    print(io.stderr, { ok: false, error: { code: error.code || "CLI_ERROR", message: error.message } }, false);
    process.exitCode = 2;
  }
}

async function resolveCommand({ path, options, flags }) {
  const pair = path.slice(0, 2).join(".");
  let command = pair === "status" ? "system.health" : pair;
  if (path[0] === "status") command = "system.health";
  if (!commandByName.has(command)) throw coded("UNKNOWN_COMMAND", `Unknown DroidLume command: ${path.join(" ")}`);
  const descriptor = commandByName.get(command);
  const args = {};
  let upload;
  let positional = path.slice(path[0] === "status" ? 1 : 2);

  for (const parameter of descriptor.parameters) {
    if (parameter.name === "path") {
      upload = resolve(positional.shift() || "");
      if (!upload) throw coded("MISSING_ARGUMENT", "Missing required argument: path");
      await access(upload, constants.R_OK).catch(() => { throw coded("FILE_NOT_FOUND", `File is not readable: ${upload}`); });
    } else if (parameter.name === "showDisplay") {
      if (flags.has("show")) args.showDisplay = true;
    } else if (positional.length && parameter.required) {
      args[parameter.name] = coerce(parameter.type, positional.shift(), parameter.name);
    }
  }
  for (const [rawKey, value] of Object.entries(options)) {
    if (["format", "timeout", "output"].includes(rawKey)) continue;
    const key = aliases[rawKey] || rawKey;
    const parameter = descriptor.parameters.find((item) => item.name === key);
    if (parameter) args[key] = coerce(parameter.type, value, key);
  }
  for (const parameter of descriptor.parameters) {
    if (parameter.required && parameter.name !== "path" && args[parameter.name] === undefined) {
      throw coded("MISSING_ARGUMENT", `Missing required argument: ${parameter.name}`);
    }
  }
  return { command, args, upload };
}

function coerce(type, value, name) {
  if (type === "integer" || integerKeys.has(name)) {
    const number = Number(value);
    if (!Number.isInteger(number)) throw coded("INVALID_ARGUMENT", `${name} must be an integer.`);
    return number;
  }
  if (type === "boolean") return value === true || value === "true" || value === "1";
  return value;
}

function parse(argv) {
  const path = [], options = {}, flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) { path.push(item); continue; }
    const raw = item.slice(2);
    if (raw.includes("=")) {
      const split = raw.indexOf("="); options[raw.slice(0, split)] = raw.slice(split + 1);
    } else if (argv[index + 1] && !argv[index + 1].startsWith("--")) {
      options[raw] = argv[++index];
    } else flags.add(raw);
  }
  return { path, options, flags };
}

function print(stream, value, pretty) {
  stream.write(`${JSON.stringify(value, null, pretty ? 2 : 0)}\n`);
}

function coded(code, message) { return Object.assign(new Error(message), { code }); }

const help = `DroidLume agent-native command line

Usage:
  droidlume status
  droidlume schema [command path]
  droidlume camera list
  droidlume device list|get|create|clone|delete|start|stop|restart|repair|show|screenshot|configure
  droidlume snapshot list|create|restore|delete
  droidlume app list|install|launch|stop|uninstall
  droidlume input text|tap|swipe|key
  droidlume diagnostics export [deviceId]
  droidlume agent config
  droidlume agent install [all|codex|claude|cursor|agents]

Examples:
  droidlume camera list --format pretty
  droidlume device configure DEVICE_ID --front-camera CAMERA_SOURCE
  droidlume snapshot create DEVICE_ID --name "Before update"
  droidlume snapshot restore DEVICE_ID SNAPSHOT_ID --timeout 300

Global options:
  --format json|pretty
  --timeout SECONDS
  --dry-run
  --help
`;
