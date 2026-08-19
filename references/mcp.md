# MCP Integration

`droidlume-mcp` is a local stdio Model Context Protocol server.

Recommended configuration uses the npm package without a separate binary
download:

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

Generate a configuration snippet:

```bash
droidlume agent config
```

Generic configuration:

```json
{
  "mcpServers": {
    "droidlume": {
      "command": "/absolute/path/droidlume-mcp",
      "args": []
    }
  }
}
```

The server exposes:

- one MCP tool per DroidLume control command;
- `droidlume://devices`, `droidlume://health`, and `droidlume://schema`
  resources;
- an `inspect_android_app` prompt;
- screenshots as native MCP image content.

Tool names replace command dots with underscores, for example:

```text
device_list
device_start
device_screenshot
app_install
input_tap
diagnostics_export
```

The MCP server starts DroidLume when required and routes all actions through the
same host control plane as the GUI and CLI.
