# 部署手册 (Deployment Guide)

这份文档详细说明了如何从零开始部署本项目，以及如何配置自动化部署（CI/CD）。

## 1. 初始部署（Initial Deployment）

使用提供的一键部署脚本，在全新的 Ubuntu 24.04 服务器上快速搭建环境。

### 前置条件
- **服务器系统**: Ubuntu 24.04 LTS (推荐)
- **权限**: 拥有 `root` 权限
- **域名**: `hololive.com.cn` 已经解析到服务器 IP

### 部署步骤

1. **连接服务器**
   使用 SSH 连接到你的服务器：
   ```bash
   ssh root@your_server_ip
   ```

2. **获取项目代码**
   你可以通过 Git 克隆或直接通过 SFTP 上传项目代码到服务器。
   > 推荐上传到 `/root/hololive.com.cn` 或 `/var/www/hololive.com.cn`，脚本会自动处理。

3. **运行部署脚本**
   进入项目目录并执行脚本：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **等待部署完成**
   脚本会自动执行以下操作：
   - 更新系统并安装 Nginx, Node.js 等依赖
   - 安装 PocketBase 并配置为系统服务
   - 自动创建 PocketBase 超级管理员（Superuser）
   - 构建前端代码
   - 配置 Nginx 反向代理
   - 使用 Certbot 自动申请 SSL 证书

5. **保存凭据**
   脚本运行结束后，屏幕上会显示以下重要信息，**请务必保存**：
   - **PocketBase Superuser**: `ryan.lan_home@outlook.com`
   - **Superuser Password**: (脚本随机生成的强密码)
   - **Web Admin**: `admin@local.dev` / `password123456`

---

## 2. 自动化部署 (CI/CD)

本项目预置了 GitHub Actions Workflow，当你推送代码到 `main` 分支时，会自动构建并部署到服务器。

### GitHub Secrets 配置

在 GitHub 项目仓库的 **Settings** -> **Secrets and variables** -> **Actions** 中添加以下 Secrets：

| Secret Name | 说明 | 示例值 |
| :--- | :--- | :--- |
| `HOST` | 服务器 IP 地址 | `123.45.67.89` |
| `USERNAME` | SSH 用户名 | `root` |
| `SSH_KEY` | SSH 私钥内容 (PEM 格式) | **直接复制 `deploy.sh` 脚本运行结束时打印的私钥内容** |

### 部署流程

1. **修改代码**: 在本地进行开发和修改。
2. **推送代码**: 将代码推送到 GitHub 的 `main` 分支。
3. **自动触发**: GitHub Actions 会自动开始构建。
   - 自动安装依赖并执行 `npm run build`
   - 通过 `rsync` 将最新的 `dist/` 目录同步到服务器 `/var/www/hololive.com.cn/dist/`
   - 通过 `rsync` 将最新的迁移脚本同步到服务器 `/var/www/hololive.com.cn/backend/pb_migrations/`
   - 远程重启 PocketBase 服务 (`systemctl restart pocketbase`) 以应用新的迁移。

---

## 3. 管理员白名单说明

系统已预置以下管理员邮箱到白名单（`whitelists` 集合）：

1. **`ryan.lan_home@outlook.com`** (您的 SSO 账号)
2. **`admin@local.dev`** (默认本地管理员)
3. **`hardy1035626987@hotmail.com`** (您要求新增的账号)

部署后，这三个账号均可作为管理员访问后台。
