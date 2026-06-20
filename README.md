<p align="center">
  <img src="web/public/logo.svg" width="64" alt="Lyns logo">
</p>

<h1 align="center">灵思 (Lyns)</h1>

<p align="center">
  AI Agent 驱动的无限画布视觉创作工具
</p>

<p align="center">
  <a href="https://github.com/abc123413/lyns"><img src="https://img.shields.io/github/stars/abc123413/lyns?style=flat-square&logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-f97316?style=flat-square" alt="License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" alt="Next.js"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react" alt="React"></a>
</p>

## 简介

灵思是一个 AI Agent 驱动的视觉创作画布。在无限画布上通过自然语言对话让 Agent 生成图片和文字，自由排列、连线、迭代，把创作从单次生成变成连续推演。

## 核心功能

- **无限画布** — 多项目、节点拖拽缩放、连线、撤销重做、导入导出、四种纸张背景
- **AI 生图工作台** — 多渠道模型配置，支持 OpenAI / Gemini / Anthropic 兼容接口，参考图编辑
- **Agent 画布助手** — Tool Calling 自动操作画布，自然语言生成图片和创建节点
- **悬浮 AI 对话** — 全页面可用的 Agent 聊天，会话历史持久化
- **多渠道模型** — 用户自行配置 API，按用途标记生图/文本模型

## 技术栈

**前端**：Next.js 16 · React 19 · TypeScript · Tailwind CSS · Ant Design 6 · Zustand · TanStack Query

## 快速开始

```bash
git clone https://github.com/abc123413/lyns.git
cd lyns/web
npm install --legacy-peer-deps
npm run dev
```

打开 http://localhost:3000，进入右上角配置填入 API Key 即可使用。
##功能展示

<img width="1915" height="1042" alt="屏幕截图 2026-06-20 173936" src="https://github.com/user-attachments/assets/2bc1b5fa-ee56-4f70-ada5-15cb2bdfbf20" />
<img width="1878" height="990" alt="屏幕截图 2026-06-20 173905" src="https://github.com/user-attachments/assets/114aba1d-752c-47be-b949-b4bb92e95d58" />



## 开源协议

GNU Affero General Public License v3.0，见 [LICENSE](LICENSE)。
