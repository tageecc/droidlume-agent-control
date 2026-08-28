# DroidLume Agent Control

[English](README.md) · [简体中文](README.zh-CN.md)

**npm-distributed CLI and MCP server plus a standard AI Agent Skill for DroidLume.**

[![npm](https://img.shields.io/npm/v/droidlume-agent-control)](https://www.npmjs.com/package/droidlume-agent-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/macOS-14%2B-black?logo=apple)](https://droidlume.talkape.net/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-stdio-5b5bd6)](references/mcp.md)
[![Agent Skill](https://img.shields.io/badge/Agent_Skill-open_standard-0a7)](SKILL.md)

DroidLume Agent Control lets **Codex, Claude Code, Cursor, Gemini, and other AI agents control local Android virtual devices** managed by [DroidLume](https://droidlume.talkape.net/). It combines a structured CLI, a local MCP server, macOS App Intents, and an open Agent Skill without relying on fragile screen-coordinate automation.

## What it can do

- Create, clone, configure, start, stop, restart, repair, show, and delete Android devices
- List available Mac cameras and configure per-device front and back camera sources
- Install APK files through a streamed sandbox upload
- List, launch, stop, and uninstall Android apps
- Type text, tap coordinates, swipe, and send Android key events
- Capture Android screenshots as PNG or native MCP image content
- Create, list, restore, and delete Personal device snapshots
- Export redacted DroidLume diagnostics
- Return stable device IDs, typed JSON, command schemas, timeouts, and structured errors

## Requirements

- Apple silicon Mac
- macOS 14 or later
- DroidLume 1.1.3 or later for host camera controls
- Node.js 20 or later

## Install

Install the CLI and MCP server from npm, then install the Skill for your agent:

```bash
npm install --global droidlume-agent-control
droidlume agent install codex
```

Or run the maintained installer, which performs the same two steps:

```bash
curl -fsSL https://raw.githubusercontent.com/tageecc/droidlume-agent-control/main/install.sh | zsh -s -- codex
```

Targets:

```text
all | codex | claude | cursor | agents
```

Verify the installation:

```bash
droidlume version
droidlume status --format pretty
droidlume device list --format pretty
```

## MCP setup

Generate an MCP configuration snippet:

```bash
droidlume agent config
```

Recommended configuration without a manually downloaded ZIP:

```json
{
  "mcpServers": {
    "droidlume": {
      "command": "npx",
      "args": ["-y", "droidlume-agent-control", "mcp"]
    }
  }
}
```

The MCP server uses stdio and exposes 28 typed tools, three resources, and an Android app inspection prompt. Screenshots are returned as native `image/png` MCP content.

## CLI examples

List camera sources and assign a Mac camera to a stopped device:

```bash
droidlume camera list --format pretty
droidlume device stop DEVICE_ID
droidlume device configure DEVICE_ID --front-camera 'host:CAMERA_UNIQUE_ID'
```

Start a device and open its window:

```bash
droidlume device start DEVICE_ID --show --timeout 180
```

Install and launch an APK:

```bash
droidlume app install DEVICE_ID /absolute/path/application.apk --timeout 300
droidlume app launch DEVICE_ID com.example.app
```

Inspect the Android screen:

```bash
droidlume device screenshot DEVICE_ID --output screen.png
droidlume input tap DEVICE_ID 540 1200
droidlume device screenshot DEVICE_ID --output screen-after.png
```

Save and restore a Personal snapshot:

```bash
droidlume device stop DEVICE_ID
droidlume snapshot create DEVICE_ID --name "Before update"
droidlume snapshot list DEVICE_ID --format pretty
droidlume snapshot restore DEVICE_ID SNAPSHOT_ID --timeout 300
```

Read the machine contract before automation:

```bash
droidlume schema
droidlume schema device start
```

See the complete [command catalog](references/commands.md), [MCP guide](references/mcp.md), [state and safety rules](references/safety.md), and [error reference](references/errors.md).

## Architecture

```text
Codex / Claude / Gemini / Cursor / CI
                    │
        Agent Skill / npm MCP / npm CLI
                    │
       DroidLume Control API v1.2
          http://127.0.0.1:55777
                    │
          DroidLume RuntimeController
                    │
             Managed Android devices
```

The public CLI and MCP server communicate with the DroidLume host app over loopback. Device lifecycle, app installation, screenshots, input, and diagnostics still run through the same RuntimeController used by the native macOS interface.

## Why DroidLume Agent Control

Generic Android automation often exposes raw ADB serials or depends on screenshot coordinates. DroidLume provides a product-level control contract instead:

- stable device UUIDs instead of transient emulator serials;
- lifecycle-aware start, stop, restart, repair, and Quick Boot handling;
- streamed APK upload into the DroidLume sandbox;
- structured command discovery and errors;
- one access-controlled plane shared by the native app, CLI, MCP, and Shortcuts.

## FAQ

### Is this an Android emulator?

DroidLume is the Android virtual device application. This repository provides the npm CLI/MCP implementation and Agent Skill used to automate it; it is not a second macOS application.

### Does it use raw ADB as the public interface?

No. AI clients call the versioned DroidLume control API. The host app owns its private ADB namespace and managed-device lifecycle.

### Which AI tools are supported?

The Agent Skill follows the open `SKILL.md` format. The CLI works from any shell, and the MCP server works with MCP-capable clients including Codex, Claude Code, Cursor, and Gemini tooling.

### Is the tool local?

Yes. The DroidLume host control endpoint listens on `127.0.0.1`, and `droidlume-mcp` uses local stdio transport.

## Links

- [DroidLume official website](https://droidlume.talkape.net/)
- [Agent Control documentation](https://droidlume.talkape.net/agent-control/)
- [npm package](https://www.npmjs.com/package/droidlume-agent-control)
- [Support](https://droidlume.talkape.net/support/)

## License

The Agent Skill and documentation in this repository are available under the [MIT License](LICENSE). DroidLume application binaries and trademarks remain subject to their respective product terms.
