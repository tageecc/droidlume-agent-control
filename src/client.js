import { createReadStream, statSync } from "node:fs";
import http from "node:http";
import { basename } from "node:path";
import { defaultBaseURL } from "./schema.js";

export class ControlError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "ControlError";
    this.code = code;
    this.details = details;
  }
}

export class DroidLumeClient {
  constructor(baseURL = process.env.DROIDLUME_CONTROL_URL || defaultBaseURL) {
    this.baseURL = new URL(baseURL);
  }

  health() {
    return this.request("GET", "/v1/health", undefined, 3_000);
  }

  execute(command, args = {}, timeoutMs = 210_000) {
    return this.request("POST", "/v1/command", {
      id: crypto.randomUUID().toLowerCase(), command, arguments: args
    }, timeoutMs);
  }

  upload(filePath, timeoutMs = 300_000) {
    const size = statSync(filePath).size;
    return new Promise((resolve, reject) => {
      const request = http.request(new URL("/v1/files", this.baseURL), {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": size,
          "X-DroidLume-Filename": basename(filePath)
        },
        timeout: timeoutMs
      }, (response) => this.collect(response, resolve, reject, (payload) => {
        if (!payload.ok || !payload.result?.path) throw this.toError(payload, "UPLOAD_FAILED");
        return payload.result.path;
      }));
      request.on("timeout", () => request.destroy(new ControlError("TIMEOUT", "DroidLume upload timed out.")));
      request.on("error", reject);
      createReadStream(filePath).on("error", reject).pipe(request);
    });
  }

  request(method, path, body, timeoutMs) {
    const encoded = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
    return new Promise((resolve, reject) => {
      const request = http.request(new URL(path, this.baseURL), {
        method,
        headers: encoded ? { "Content-Type": "application/json", "Content-Length": encoded.length } : {},
        timeout: timeoutMs
      }, (response) => this.collect(response, resolve, reject, (payload) => {
        if (!payload.ok) throw this.toError(payload);
        return payload;
      }));
      request.on("timeout", () => request.destroy(new ControlError("TIMEOUT", "DroidLume request timed out.")));
      request.on("error", reject);
      if (encoded) request.write(encoded);
      request.end();
    });
  }

  collect(response, resolve, reject, transform) {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("error", reject);
    response.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        const payload = text ? JSON.parse(text) : {};
        if ((response.statusCode || 500) >= 300) throw this.toError(payload, `HTTP_${response.statusCode}`);
        resolve(transform(payload));
      } catch (error) { reject(error); }
    });
  }

  toError(payload, fallback = "COMMAND_FAILED") {
    return new ControlError(payload.error?.code || fallback, payload.error?.message || "DroidLume control request failed.", payload.error?.details);
  }
}
