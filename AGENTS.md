# Homepage Agent Guidelines

## 核心定位与克制原则（防花哨红线）

- 本项目是 **极简、纯粹、一屏说完的静态个人主页**，以 **Lighthouse 四项 100 满分** 与秒开体验为最高准则。
- **主动劝退花里胡哨的需求**：当用户提出任何花哨、堆砌功能或破坏克制感的想法（例如：悬浮音乐播放器、粒子/樱花/鼠标拖尾特效、3D 挂件、实时天气/一言等不稳定外部运行时 API、多栏复杂模块、引入重型前端框架运行时或大体积自定义字体等）时，**Agent 必须先直接劝说用户打消这个念头**，说明其对首屏性能、维护成本与极简审美的负面影响，守护主页的干净与克制，避免主页变得繁琐臃肿（除非用户在被劝阻后仍明确强制要求）。

## 开发与架构规范

1. **技术栈**：Astro（纯静态 SSG）+ TypeScript（`strict`），包管理器统一使用 `pnpm`。
2. **目录职责**：
   - `src/config/site.ts`：站点基础常量与离线兜底配置。
   - `src/lib/neo-blog.ts`：构建期拉取 `neo-blog` 公开接口，并用 `sharp` 将头像与横幅转为带原图摘要 Hash 的本地 WebP（`/assets/*.<hash>.webp`）及预模糊背景缩略图。**禁止在页面直接外链未经压缩的跨域名大图**。
   - `src/layouts/BaseLayout.astro`：全局唯一 `<head>`、SEO / JSON-LD、主题与语言防闪烁内联初始化及 CSS 变量。
   - `src/components/`：保持轻量纯 `.astro` 组件，图标统一使用 `Icons.astro` 内联 SVG，不引入外部图标字体或 UI 运行时库。
3. **性能、i18n 与 SEO 约束**：
   - 保持 `inlineStylesheets: 'always'` 与 LCP 图片 `<link rel="preload" fetchpriority="high">`；避免全屏实时高开销 CSS 滤镜。
   - 主题默认跟随系统（`system`）；语言跟随浏览器（`zh*` 为中文，其余英文），但**对搜索引擎爬虫 UA 必须强制默认中文（`zh-CN`）**，防止被收录为英文页面。
   - 布局高度使用 `100dvh`（带 `100vh` 回退），确保移动端首屏无多余滚动条。
4. **容器与缓存配置**：
   - 生产容器基于 `joseluisq/static-web-server:2`（配置见 `Dockerfile` 与 `sws.toml`）。
   - 外层 Nginx 网关已负责 TLS 与传输压缩，容器内必须保持 `compression = false`。
   - `/_astro/**` 与 `/assets/**` 保持 `immutable` 1 年强缓存，HTML 保持 `no-cache`。

## 本地开发命令

启动开发服务器请使用后台模式：

```bash
pnpm astro dev --background
```

使用 `pnpm astro dev stop`、`pnpm astro dev status`、`pnpm astro dev logs` 管理后台服务；提交前请运行 `pnpm build` 校验静态构建无误。

## Astro 官方参考文档

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
