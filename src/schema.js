const p = (name, type, description, required = false, allowedValues) => ({
  name, type, required, description, ...(allowedValues ? { allowedValues } : {})
});

const deviceId = p("deviceId", "string", "Stable DroidLume device UUID returned by device.list.", true);
const packageName = p("packageName", "string", "Android application package name.", true);
const snapshotId = p("snapshotId", "string", "Stable snapshot UUID returned by snapshot.list.", true);
const command = (name, summary, risk, parameters = [], timeoutSeconds = 30) => ({
  name, summary, risk, timeoutSeconds, parameters
});

export const controlApiVersion = "1.1";
export const defaultBaseURL = "http://127.0.0.1:55777";

export const commands = [
  command("system.health", "Read host, API, and runtime health.", "read"),
  command("system.schema", "Read the complete command contract.", "read"),
  command("device.list", "List managed Android devices and lifecycle state.", "read"),
  command("device.get", "Read one managed device.", "read", [deviceId]),
  command("device.create", "Create a managed Android device.", "control", [p("name", "string", "Optional user-facing device name.")], 90),
  command("device.clone", "Clone an existing stopped device.", "control", [deviceId], 180),
  command("device.delete", "Delete a device and its writable Android data.", "destructive", [deviceId], 180),
  command("device.start", "Start Android and wait until it is ready.", "control", [deviceId, p("showDisplay", "boolean", "Open the interactive device window after boot.")], 180),
  command("device.stop", "Stop Android and persist Quick Boot state.", "control", [deviceId], 60),
  command("device.restart", "Restart Android and wait until it is ready.", "control", [deviceId], 180),
  command("device.repair", "Clear disposable launch state while preserving userdata.", "control", [deviceId], 120),
  command("device.show", "Open or focus the interactive device window.", "control", [deviceId]),
  command("device.screenshot", "Capture the current Android display as PNG.", "read", [deviceId]),
  command("snapshot.list", "List Personal snapshots for a stopped device.", "read", [deviceId]),
  command("snapshot.create", "Create a Personal snapshot of a stopped device.", "control", [
    deviceId, p("name", "string", "User-facing snapshot name.", true)
  ], 300),
  command("snapshot.restore", "Restore a stopped device from a Personal snapshot.", "destructive", [deviceId, snapshotId], 300),
  command("snapshot.delete", "Delete a Personal device snapshot.", "destructive", [deviceId, snapshotId], 120),
  command("device.configure", "Update supported device profile fields.", "control", [
    deviceId, p("name", "string", "User-facing name."), p("manufacturer", "string", "Android manufacturer profile."),
    p("modelName", "string", "Android model profile."), p("cpuCores", "integer", "CPU core count."),
    p("memoryGB", "integer", "RAM in GiB."), p("width", "integer", "Display width in pixels."),
    p("height", "integer", "Display height in pixels."), p("dpi", "integer", "Display density."),
    p("maxFPS", "integer", "Maximum display frame rate."), p("storageGB", "integer", "Writable userdata capacity in GiB."),
    p("phoneNumber", "string", "Test telephony line number."), p("operatorName", "string", "Test mobile operator name.")
  ], 60),
  command("app.list", "List third-party Android packages.", "read", [deviceId]),
  command("app.install", "Install a local APK through DroidLume's upload endpoint.", "control", [deviceId, p("path", "string", "Absolute local APK path.", true)], 180),
  command("app.launch", "Launch an installed Android application.", "control", [deviceId, packageName]),
  command("app.stop", "Force-stop an Android application.", "control", [deviceId, packageName]),
  command("app.uninstall", "Uninstall an Android application and its app data.", "destructive", [deviceId, packageName], 60),
  command("input.text", "Type UTF-8 text into the focused Android control.", "control", [deviceId, p("text", "string", "Text to enter.", true)]),
  command("input.tap", "Tap Android display coordinates.", "control", [deviceId, p("x", "integer", "X coordinate.", true), p("y", "integer", "Y coordinate.", true)]),
  command("input.swipe", "Swipe between Android display coordinates.", "control", [deviceId, p("x1", "integer", "Start X.", true), p("y1", "integer", "Start Y.", true), p("x2", "integer", "End X.", true), p("y2", "integer", "End Y.", true), p("durationMs", "integer", "Gesture duration in milliseconds.")]),
  command("input.key", "Send an Android key event.", "control", [deviceId, p("key", "string", "Android key name or numeric key code.", true)]),
  command("diagnostics.export", "Create a redacted diagnostic bundle in DroidLume storage.", "read", [p("deviceId", "string", "Optional device UUID to focus the report.")], 60)
];

export const commandByName = new Map(commands.map((item) => [item.name, item]));
