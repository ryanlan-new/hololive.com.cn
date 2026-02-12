# GitHub Self-Hosted Runner Setup Guide

本指南将帮助您在阿里云服务器上安装 GitHub Actions Runner，从而绕过 Gitee 同步步骤，直接从服务器拉取代码并部署。

## 第一步：获取 RunnerToken

1.  进入您的 GitHub 仓库页面。
2.  点击 **Settings** -> **Actions** -> **Runners**。
3.  点击 **New self-hosted runner**。
4.  选择 **Linux** 系统。

## 第二步：在服务器上安装 Runner

*请使用 SSH 连接到您的服务器，并执行以下命令（建议使用非 root 用户，但为了简单起见，以下假设您如果用 root 运行需要额外参数）：*

### 1. 创建 Runner 目录
```bash
# 创建一个文件夹
mkdir actions-runner && cd actions-runner
```

### 2. 下载 Runner (请参考 GitHub 页面给出的最新版本命令)
*示例 (GitHub 页面会提供包含 Token 的准确命令，请复制那里的)*：
```bash
# 举例：
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### 3. 配置 Runner
**关键步骤**：GitHub 页面生成的 `config.sh` 命令。
```bash
# 如果您是 root 用户，必须加上 --allow-run-as-root 参数
./config.sh --url https://github.com/YourRepo/hololive.com.cn --token A1B2C3D4... --allow-run-as-root
```
*   **Runner group**: Default
*   **Runner name**: (默认即可，或输入 `aliyun-server`)
*   **Labels**: (默认即可，包含 `self-hosted`, `linux`, `x64`)
*   **Work folder**: `_work` (默认即可)

### 4. 安装为系统服务 (后台运行 & 开机自启)
```bash
./svc.sh install
./svc.sh start
```
此时 Runner 应该显示为 `Active (Running)`。在 GitHub 页面上刷新，您应该能看到 Runner 状态为 `Idle` (空闲)。

## 第三步：权限配置 (已完成)

**我已通过 Root 权限为您配置了 `ubuntu` 用户的免密 sudo 权限。**
Runner 在重启服务时 (`sudo systemctl restart pocketbase`) 将不再需要输入密码。

您可以直接进行下一步。

## 第四步：清理旧配置

我已帮您删除了 Gitee 相关的 Webhook 脚本。您还需要清理一下 `deploy.sh` 中残留的 PM2 进程配置（我会帮您更新脚本）。

---

**配置完成后，任何推送到 `main` 分支的代码都会直接由这就服务器拉取并部署。**
