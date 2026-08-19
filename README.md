# DroidLume Agent Control

**Android emulator MCP server, command-line interface, and AI Agent Skill for macOS.**

[![Release](https://img.shields.io/github/v/release/tageecc/droidlume-agent-control)](https://github.com/tageecc/droidlume-agent-control/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/macOS-14%2B-black?logo=apple)](https://droidlume.talkape.net/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-stdio-5b5bd6)](references/mcp.md)
[![Agent Skill](https://img.shields.io/badge/Agent_Skill-open_standard-0a7)](SKILL.md)

DroidLume Agent Control lets **Codex, Claude Code, Cursor, Gemini, and other AI agents control local Android virtual devices** managed by [DroidLume](https://droidlume.talkape.net/). It combines a structured CLI, a local MCP server, macOS App Intents, and an open Agent Skill without relying on fragile screen-coordinate automation.

## What it can do

- Create, clone, configure, start, stop, restart, repair, show, and delete Android devices
- Install APK files through a streamed sandbox upload
- List, launch, stop, and uninstall Android apps
- Type text, tap coordinates, swipe, and send Android key events
- Capture Android screenshots as PNG or native MCP image content
- Export redacted DroidLume diagnostics
- Return stable device IDs, typed JSON, command schemas, timeouts, and structured errors

## Requirements

- Apple silicon Mac
- macOS 14 or later
- DroidLume 1.1 or later

## Install

Install the signed and Apple-notarized CLI, MCP server, and Agent Skill:

```bash
curl -fsSL https://raw.githubusercontent.com/tageecc/droidlume-agent-control/main/install.sh | zsh -s -- codex
```

Targets:

```text
all | codex | claude | cursor | agents
```

The default binary directory is `~/.local/bin`. Add it to `PATH` if needed:

```bash
export PATH="$HOME/.local/bin:$PATH"
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

Generic configuration:

```json
{
  "mcpServers": {
    "droidlume": {
      "command": "/Users/YOU/.local/bin/droidlume-mcp",
      "args": []
    }
  }
}
```

The MCP server uses stdio and exposes 23 typed tools, three resources, and an Android app inspection prompt. Screenshots are returned as native `image/png` MCP content.

## CLI examples

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
          Agent Skill / MCP / CLI
                    │
       DroidLume Control API v1.0
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
- one control plane shared by the native app, CLI, MCP, and Shortcuts.

## FAQ

### Is this an Android emulator?

DroidLume is the Android virtual device application. This repository provides the MCP server, CLI distribution, and Agent Skill used to automate it.

### Does it use raw ADB as the public interface?

No. AI clients call the versioned DroidLume control API. The host app owns its private ADB namespace and managed-device lifecycle.

### Which AI tools are supported?

The Agent Skill follows the open `SKILL.md` format. The CLI works from any shell, and the MCP server works with MCP-capable clients including Codex, Claude Code, Cursor, and Gemini tooling.

### Is the tool local?

Yes. The DroidLume host control endpoint listens on `127.0.0.1`, and `droidlume-mcp` uses local stdio transport.

## Links

- [DroidLume official website](https://droidlume.talkape.net/)
- [Agent Control documentation](https://droidlume.talkape.net/agent-control/)
- [Downloads](https://github.com/tageecc/droidlume-agent-control/releases/latest)
- [Support](https://droidlume.talkape.net/support/)

## License

The Agent Skill and documentation in this repository are available under the [MIT License](LICENSE). DroidLume application binaries and trademarks remain subject to their respective product terms.
