CTO 优化指令 (Prompt)

请作为本项目的 CTO，执行一次全面的代码库大扫除与升级。我已经没有任何技术背景，请你自动完成以下所有步骤，无需向我确认中间过程，直接输出最终修改后的文件。

任务目标

优化项目架构，移除无用文件，确保依赖最新，并标准化数据库操作。

执行步骤 (Chain of Thought)

第一步：依赖升级与环境检查

检查 package.json。将所有依赖（react, vite, tailwindcss, pocketbase, framer-motion, tiptap 等）的版本号修改为当前最新的稳定版本（Latest Stable）。

确保 vite.config.js 配置符合 Vite 7 的最佳实践。

第二步：清理无用文件 (Dead Code Elimination)

扫描 src/ 目录。分析所有组件、Hooks 和工具函数。

删除任何未被 App.jsx, main.jsx 或 router.jsx 引用链包含的文件。

删除 public/ 目录下未在代码中引用的旧图片资源（保留 public/holocn 和 public/errors 中确实使用的）。

检查 README 中提到的“旧版配置文档”或废弃脚本，如果有，请直接删除。

第三步：数据库规范化

检查当前代码中是否有硬编码的数据逻辑。如果有，请创建一个新的 PocketBase Migration 文件 (backend/pb_migrations/) 来处理这些数据。

确保 pb_schema.json 是根据当前业务逻辑生成的最新状态。

第四步：代码质量优化

检查 src/components。如果发现有重复逻辑的代码，请重构为通用组件。

确保所有 UI 组件的默认文本（Default Props 或硬编码文本）都是简体中文。

输出要求

对于修改的文件，请直接给出完整的代码块。

对于需要删除的文件，请在最后列出一个 Shell 脚本或清单，让我知道哪些文件被移除了。

如果涉及数据库变动，请直接生成 .js 迁移文件。

请开始执行。