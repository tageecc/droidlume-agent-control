# Error Handling

CLI failures are JSON objects written to stderr. MCP failures use tool results
with `isError: true`.

Common codes:

| Code | Meaning | Response |
| --- | --- | --- |
| `APP_UNAVAILABLE` | DroidLume did not start its control service | Open DroidLume and retry |
| `DEVICE_NOT_FOUND` | Device ID is stale or malformed | Run `device list` |
| `DEVICE_NOT_RUNNING` | Android action requires a running device | Run `device start` |
| `DEVICE_START_FAILED` | Android entered an error state | Export diagnostics, repair, restart |
| `DEVICE_NOT_STOPPED` | Operation requires a stopped device | Stop the device, then retry |
| `INVALID_CAMERA_SOURCE` | Camera source ID is malformed | Reuse an exact ID from `camera list` |
| `CAMERA_UNAVAILABLE` | A configured Mac camera is disconnected or missing | Run `camera list` and configure an available source |
| `CAMERA_SOURCE_CONFLICT` | One Mac camera is assigned to both Android cameras | Choose distinct sources or leave one as `emulated` |
| `INVALID_PACKAGE` | Package name is malformed | Read `app list` and reuse exact value |
| `FILE_NOT_FOUND` | APK path is unreadable | Resolve an absolute local path |
| `TIMEOUT` | Operation exceeded the selected timeout | Read device state before retrying |
| `COMMAND_FAILED` | Runtime or ADB action failed | Inspect message and export diagnostics |

Do not blindly replay a mutation after a timeout. Read state first because the
underlying operation may have completed after the client deadline.
