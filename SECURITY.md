# Security

Report security issues privately to tageecc@gmail.com. Include the affected version, reproduction steps, expected behavior, and observed behavior. Avoid opening public issues for undisclosed vulnerabilities.

DroidLume Agent Control communicates with the host application over `127.0.0.1` and uses MCP stdio for AI clients. APK uploads are streamed into DroidLume application storage before installation.
