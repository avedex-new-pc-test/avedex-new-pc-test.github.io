
# Ave.ai 新版 PC

## 项目介绍

这是一个基于 Nuxt 3 的静态网站项目，采用了多种插件与功能配置，包括但不限于：

- **多语言支持**：使用 `@nuxtjs/i18n` 实现多语言功能
- **PWA 支持**：使用 `@vite-pwa/nuxt` 插件实现渐进式 Web 应用（PWA）功能
- **UI 框架**：使用 Element Plus 作为 UI 组件库
- **状态管理**：使用 Pinia 作为状态管理库
- **样式管理**：使用 UnoCSS 进行按需生成样式

## 项目结构

```
.
├── src/                     # 项目源代码目录
│   ├── api/                 # API 请求相关
│   ├── assets/              # 静态资源目录
│   ├── components/          # 组件
│   ├── composables/         # 组合式 API
│   ├── layouts/             # 布局组件
│   ├── pages/               # 页面组件
│   ├── plugins/             # 插件
│   ├── store/               # Pinia 状态管理
│   ├── public/              # 公共资源目录 (如图片、字体等)
│   ├── app.vue              # 应用的根组件
├── i18n/                    # 国际化文件夹
│   └── lang/                # 语言文件夹
│       ├── en.json          # 英语语言文件
│       ├── zh-cn.json       # 中文语言文件
│       ├── ...              # 其他语言文件
├── eslint.config.mjs        # ESLint 配置文件
├── uno.config.ts            # UnoCSS 配置文件
├── nuxt.config.ts           # Nuxt 配置文件
└── package.json             # 项目依赖和脚本

```

## 安装依赖

首先克隆或下载项目：

```bash
git clone <your-repository-url>
cd <project-directory>
```

然后使用 `pnpm` 安装依赖：

```bash
pnpm install
```

## 配置

### 国际化 (i18n)

项目使用 `@nuxtjs/i18n` 插件来支持多语言。在 `src/lang/` 目录下，你可以管理各个语言的 JSON 文件。默认配置加载了英语和中文。

配置文件位于 `src/nuxt.config.ts`，你可以修改默认语言和其他相关配置。

### PWA 配置

项目已经集成了 `@vite-pwa/nuxt` 插件来支持渐进式 Web 应用（PWA）。配置文件位于 `src/nuxt.config.ts`，并且你可以根据需求修改 PWA 的 manifest 文件。

### UnoCSS 配置

项目使用 UnoCSS 进行样式管理，`uno.config.ts` 是 UnoCSS 的配置文件。你可以在此文件中定义你的样式规则，例如按需引入的 CSS 类名和其他优化选项。

## 路由说明

### 路由自动生成

Nuxt 3 自动根据 `src/pages/` 目录中的文件生成路由。每个 `.vue` 文件都会被映射为一个路由，并且目录结构决定了路由的路径。

- **根路由**：`src/pages/index.vue` 会自动映射为 `/` 路由。
- **嵌套路由**：`src/pages/about.vue` 会自动映射为 `/about` 路由，`src/pages/blog/index.vue` 会映射为 `/blog`。
- **动态路由**：`src/pages/blog/[slug].vue` 会映射为 `/blog/:slug`，其中 `slug` 是动态的路由参数。

### 动态路由示例

在 `src/pages/blog/[slug].vue` 中，`slug` 参数可以通过 `useRoute` 钩子来访问：

```vue
<script setup>
const route = useRoute();
const slug = route.params.slug;
</script>
```

## 开发

启动开发服务器：

```bash
pnpm dev
```

开发过程中，Nuxt 会在 `localhost:3000` 上提供实时更新。

## 生成静态网站

要生成静态网站，你可以运行以下命令：

```bash
pnpm generate
```

生成的静态文件将被输出到 `dist/` 目录，你可以将 `dist/` 目录中的文件上传到服务器进行部署。
