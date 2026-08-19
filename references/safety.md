# State and Safety Rules

## Device identity

Use `device.id`. Display names can change and emulator serials are runtime
details. A serial is never a durable selector.

## Lifecycle

- `device.start` waits until Android reaches the running state or returns a
  structured start error.
- `device.stop` waits for the managed process to stop and Quick Boot state to
  settle.
- `device.restart` waits for the restarted Android instance.
- `device.repair` preserves userdata and installed Android applications while
  clearing disposable launch and snapshot state.
- `device.delete` removes the writable Android device data.

## Input verification

Input commands confirm delivery, not the Android application's interpretation.
Capture and inspect a screenshot after a meaningful input sequence.

## Destructive commands

The destructive commands are:

```text
device.delete
app.uninstall
```

Use the active agent host's confirmation policy before invocation. Re-read the
device or app list after completion.

## Files

Pass absolute local paths for APK installation and screenshot output. DroidLume
accepts uploads only through its loopback control service and stores them inside
its own app container.

