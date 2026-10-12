# 0001: 采用 Astro + React 静态架构与 GitHub Pages 自动化部署

我们决定采用 Astro 作为站点核心静态生成器（SSG），结合 React Islands 承载高交互全息沙盘（Holotable）与命令行（Boot Terminal），并通过 GitHub Actions 自动化构建部署至 GitHub Pages。

## Context

站点需要极致的扩展性（支持后续通过 Markdown/MDX 扩充文章、项目及子应用），同时核心视觉依赖 WebGL/Canvas 三维地形渲染与低延迟 CLI 字符交互。若采用纯单页 SPA（如纯 Vite + React），在内容管理与 SEO 扩展上较为笨重；若采用纯静态 HTML，则无法维持复杂的组件化沙盘与解密状态管理。Astro 提供了开箱即用的静态内容集合（Content Collections）并允许按需水合 React 交互岛，完美契合静态托管与高频交互的双重诉求。

## Consequences

- 站点所有页面默认预渲染为零额外运行时 JS 的静态 HTML，确保 GitHub Pages 高速秒开。
- 全息沙盘与终端以独立客户端组件挂载，相互解耦且易于独立测试。
- 业务扩展仅需在 `src/content/` 添加 Markdown 文件或在 `src/components/modules/` 添加新战术卡片。
