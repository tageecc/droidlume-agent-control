# DroidLume Agent Control

[English](README.md) · [简体中文](README.zh-CN.md)

面向 DroidLume 的标准 Agent Skill，以及通过 npm 分发的 CLI 与 MCP Server。它让 Codex、Claude Code、Cursor、Gemini 和 CI 使用结构化工具操作本机 Android 设备，不依赖窗口坐标，也不直接暴露 DroidLume 的私有 ADB。

## 能力

- 创建、复制、配置、启动、停止、重启、修复和删除 Android 设备
- 安装、列出、启动、停止和卸载 Android 应用
- 输入文字、点击、滑动和发送 Android 按键
- 截图并以 PNG 或 MCP Image Content 返回
- 创建、列出、恢复和删除 Personal 设备快照
- 导出脱敏诊断信息
- 使用稳定设备 UUID、结构化 JSON、命令 Schema、超时和明确错误码

## 环境要求

- Apple 芯片 Mac
- macOS 14 或更高版本
- DroidLume 1.1 或更高版本
- Node.js 20 或更高版本

## 安装

安装 CLI 与 MCP Server：

```bash
npm install --global droidlume-agent-control
```

再为对应 Agent 安装 Skill：

```bash
droidlume agent install codex
```

支持的目标：

```text
all | codex | claude | cursor | agents
```

验证安装：

```bash
droidlume version
droidlume status --format pretty
droidlume device list --format pretty
```

## MCP 配置

直接生成配置：

```bash
droidlume agent config
```

推荐使用 npm 启动，不需要下载额外 ZIP：

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

MCP Server 提供 27 个类型化工具、三个资源以及 Android 应用检查 Prompt；截图会作为原生 `image/png` 内容返回。

## CLI 示例

```bash
# 启动设备并打开交互窗口
droidlume device start DEVICE_ID --show --timeout 180

# 安装并启动 APK
droidlume app install DEVICE_ID /absolute/path/application.apk --timeout 300
droidlume app launch DEVICE_ID com.example.app

# 截图和输入
droidlume device screenshot DEVICE_ID --output screen.png
droidlume input tap DEVICE_ID 540 1200
droidlume input text DEVICE_ID "hello"

# 停止设备后创建和恢复 Personal 快照
droidlume device stop DEVICE_ID
droidlume snapshot create DEVICE_ID --name "更新前"
droidlume snapshot list DEVICE_ID --format pretty
droidlume snapshot restore DEVICE_ID SNAPSHOT_ID --timeout 300
```

完整命令见 [命令目录](references/commands.md)、[MCP 指南](references/mcp.md)、[状态规则](references/safety.md)和[错误说明](references/errors.md)。

## 架构

```text
Codex / Claude / Gemini / Cursor / CI
                    │
       Agent Skill / npm MCP / npm CLI
                    │
       DroidLume Control API v1.1
          http://127.0.0.1:55777
                    │
          DroidLume RuntimeController
                    │
             Android 虚拟设备
```

CLI 与 MCP 只访问本机环回地址。设备生命周期、APK 安装、截图、输入和诊断仍由 DroidLume 原生应用统一执行。

## Skill 与 npm 包的关系

- `SKILL.md`：告诉 Agent 如何选择命令、检查状态和处理错误。
- `droidlume`：适合人类、脚本和 Agent 的结构化 CLI。
- `droidlume-mcp`：适合 MCP 客户端的本机 stdio Server。
- `DroidLume.app`：运行 Android 设备并提供版本化控制 API。

这个仓库不是第二个 macOS 应用，也不需要单独下载 Darwin ZIP。

## 安全与隐私

- 控制端点只监听 `127.0.0.1`。
- APK 使用流式上传进入 DroidLume 应用容器。
- DroidLume 继续管理私有 ADB、设备序列号、Quick Boot 和运行进程。
- 具体 AI 客户端如何处理截图与工具结果，以该客户端的设置为准。

## 链接

- [DroidLume 官网](https://droidlume.talkape.net/)
- [Agent Control 文档](https://droidlume.talkape.net/agent-control/)
- [npm 包](https://www.npmjs.com/package/droidlume-agent-control)
- [支持](https://droidlume.talkape.net/support/)

## License

Agent Skill、CLI、MCP Server 和文档使用 [MIT License](LICENSE)。DroidLume 应用及商标适用各自的产品条款。
