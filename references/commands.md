# DroidLume Command Catalog

## Discovery

```bash
droidlume version
droidlume status
droidlume schema
droidlume schema device start
droidlume agent config
```

## Cameras

```bash
droidlume camera list
droidlume device stop DEVICE_ID
droidlume device configure DEVICE_ID --front-camera 'host:CAMERA_UNIQUE_ID'
```

Use only source IDs returned by `camera list`. Camera source changes require a
stopped device. `emulated` remains the default for both cameras.

## Devices

```bash
droidlume device list
droidlume device get DEVICE_ID
droidlume device create --name "DEVICE NAME"
droidlume device clone DEVICE_ID
droidlume device delete DEVICE_ID
droidlume device start DEVICE_ID [--show]
droidlume device stop DEVICE_ID
droidlume device restart DEVICE_ID
droidlume device repair DEVICE_ID
droidlume device show DEVICE_ID
droidlume device screenshot DEVICE_ID --output FILE.png
```

## Personal snapshots

```bash
droidlume snapshot list DEVICE_ID
droidlume snapshot create DEVICE_ID --name "Before update"
droidlume snapshot restore DEVICE_ID SNAPSHOT_ID
droidlume snapshot delete DEVICE_ID SNAPSHOT_ID
```

Stop the device before creating or restoring a snapshot. Snapshot commands
require DroidLume Personal.

Configuration accepts named options:

```bash
droidlume device configure DEVICE_ID \
  --name "My Android" \
  --manufacturer Samsung \
  --model "Galaxy S24" \
  --cpu 8 --memory 8 \
  --width 1080 --height 2400 --dpi 420 --fps 60 \
  --storage 32 \
  --phone +8613800138000 \
  --operator "China Telecom"
```

## Android applications

```bash
droidlume app list DEVICE_ID
droidlume app install DEVICE_ID /absolute/path/application.apk
droidlume app launch DEVICE_ID PACKAGE_NAME
droidlume app stop DEVICE_ID PACKAGE_NAME
droidlume app uninstall DEVICE_ID PACKAGE_NAME
```

APK installation streams the file into DroidLume's sandbox before the private
ADB server receives it. The CLI removes the staged upload after installation.

## Input

```bash
droidlume input text DEVICE_ID "text"
droidlume input tap DEVICE_ID X Y
droidlume input swipe DEVICE_ID X1 Y1 X2 Y2 --duration 300
droidlume input key DEVICE_ID HOME
```

Common keys: `HOME`, `BACK`, `APP_SWITCH`, `ENTER`, `DEL`, `POWER`,
`VOLUME_UP`, `VOLUME_DOWN`. Numeric Android key codes are also accepted.

## Diagnostics

```bash
droidlume diagnostics export [DEVICE_ID]
```

The response contains the path to a redacted `.droidlumediag` directory.

## Global flags

```text
--format json|pretty
--timeout SECONDS
--dry-run
--help
```
