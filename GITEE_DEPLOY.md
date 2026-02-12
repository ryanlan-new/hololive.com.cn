# Gitee 自动化部署配置指南

本指南将帮助您设置 GitHub -> Gitee -> 阿里云服务器的自动化部署流程。

## 第一步：准备 Gitee 仓库

1.  登录 [Gitee](https://gitee.com)。
2.  创建一个新的仓库，名称建议与 GitHub 仓库一致（例如 `hololive.com.cn`）。
3.  确保仓库是**私有**或**公开**（建议私有）。

## 第二步：生成密钥与令牌

### 1. Gitee 私人令牌 (Token)
1.  访问 [Gitee 私人令牌设置](https://gitee.com/profile/personal_access_tokens)。
2.  点击“生成新令牌”。
3.  权限选择：`projects` (读写项目) 和 `hook` (Webhooks)。
4.  **复制并保存生成的 Token**。

### 2. 生成 SSH 密钥对 (用于同步)
在您的本地终端运行：
```bash
ssh-keygen -t rsa -b 4096 -f gitee_deploy_key -N ""
```
这将生成 `gitee_deploy_key` (私钥) 和 `gitee_deploy_key.pub` (公钥)。

### 3. 配置 Gitee 公钥
1.  回到 Gitee 仓库页面。
2.  进入 **管理** -> **部署公钥管理** -> **添加部署公钥**。
3.  将 `gitee_deploy_key.pub` 的内容粘贴进去。
4.  勾选 **"允许推送权限"**。

## 第三步：配置 GitHub Secrets

在您的 GitHub 仓库中，进入 **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**，添加以下 Secrets：

| Secret Name | Value | 说明 |
| :--- | :--- | :--- |
| `GITEE_USERNAME` | 您的 Gitee 用户名 | 例如 `ryanlan` |
| `GITEE_TOKEN` | 您的 Gitee 私人令牌 | 第一步生成的 Token |
| `GITEE_PRIVATE_KEY` | `gitee_deploy_key` 私钥内容 | 第二步生成的私钥（包含开头和结尾） |

## 第四步：配置服务器 Webhook

### 1. 更新服务器
登录到您的服务器，拉取最新代码并运行部署脚本更新 Nginx 配置：
```bash
cd /var/www/hololive.com.cn
git pull
./deploy.sh
```
*注意：这会安装 PM2 并启动 Webhook 监听服务。*

### 2. 在 Gitee 配置 Webhook
1.  进入 Gitee 仓库 **管理** -> **WebHooks** -> **添加 WebHook**。
2.  **URL**: `https://hololive.com.cn/api/webhook/gitee`
3.  **密码/签名密钥**: `changeme` (或者您在环境变量中设置的值)
4.  **事件**: 勾选 `Push`。
5.  点击“添加”。

## 第五步：测试
1.  在 GitHub 上修改任意文件并推送。
2.  查看 GitHub Actions `Sync to Gitee` 任务是否成功。
3.  查看 Gitee 仓库是否更新。
4.  查看 Gitee Webhook 历史记录，确认请求是否成功 (200 OK)。
5.  查看服务器是否自动重新部署。
