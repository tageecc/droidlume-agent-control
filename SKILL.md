---
name: droidlume-control
description: Operate DroidLume-managed Android devices through the structured DroidLume CLI. Use for creating, starting, stopping, configuring, snapshotting, inspecting, repairing, and screenshotting devices; installing or launching APKs; sending Android input; and collecting diagnostics.
license: MIT
metadata:
  author: TalkApe (Hangzhou) Technology Co., Ltd.
  version: "1.2.0"
---

# DroidLume Control

Use the `droidlume` CLI as the authoritative control surface. Do not automate the
manager window by coordinates and do not invoke DroidLume's private ADB server
directly.

This repository is a standard Agent Skill. Its executable CLI and MCP transport
are distributed by the `droidlume-agent-control` npm package rather
than a macOS ZIP installer.

## Start every workflow

1. Run `droidlume status --format pretty`.
2. Run `droidlume device list --format pretty`.
3. Select a device by the stable `id` field, never by list position or emulator
   serial.
4. Inspect a leaf contract with `droidlume schema device start` when parameter
   or risk semantics are unclear.

The CLI launches DroidLume when needed and waits for the local control service.

## Execution rules

- Use `--dry-run` to preview a command when mapping a new workflow.
- Pass an explicit device ID to every device, app, or input command.
- After start, stop, restart, repair, configure, install, launch, or uninstall,
  read the device or app state again instead of assuming completion.
- Use `--timeout` for workflows that may legitimately need more time.
- Prefer structured JSON. Use `--format pretty` only when presenting output to a
  person.
- Save screenshots to an explicit path with `--output` and inspect the image
  before declaring a UI task complete.
- Treat `device delete` and `app uninstall` as destructive operations. Follow
  the active agent host's confirmation rules before invoking them.
- Keep package names and device IDs exactly as returned by DroidLume.

## Common workflows

### Start a device and open its window

```bash
droidlume device start DEVICE_ID --show --timeout 180
droidlume device get DEVICE_ID --format pretty
```

### Use a Mac camera in Android

```bash
droidlume camera list --format pretty
droidlume device stop DEVICE_ID --timeout 60
droidlume device configure DEVICE_ID --front-camera 'host:CAMERA_UNIQUE_ID'
droidlume device start DEVICE_ID --show --timeout 180
```

Camera sources are stable IDs returned by `camera list`; do not guess a
`webcamN` value. DroidLume requests macOS camera permission only when starting
a device configured with a Mac camera.

### Install and launch an APK

```bash
droidlume device start DEVICE_ID --timeout 180
droidlume app install DEVICE_ID /absolute/path/application.apk --timeout 300
droidlume app list DEVICE_ID --format pretty
droidlume app launch DEVICE_ID PACKAGE_NAME
```

### Inspect an Android screen

```bash
droidlume device screenshot DEVICE_ID --output /tmp/droidlume-screen.png
```

Inspect `/tmp/droidlume-screen.png`, then use `input tap`, `input swipe`,
`input text`, or `input key`. Capture a second screenshot to verify the result.

### Recover a failed device

```bash
droidlume device get DEVICE_ID --format pretty
droidlume diagnostics export DEVICE_ID
droidlume device repair DEVICE_ID --timeout 120
droidlume device start DEVICE_ID --timeout 180
```

## References

- Command catalog: [references/commands.md](references/commands.md)
- Safety and state rules: [references/safety.md](references/safety.md)
- MCP setup and tools: [references/mcp.md](references/mcp.md)
- Error handling: [references/errors.md](references/errors.md)
