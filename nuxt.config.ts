// https://nuxt.com/docs/api/configuration/nuxt-config
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const isProd = process.env.NODE_ENV === 'production'
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-04-24',
  srcDir: 'src/',
  devtools: {
    enabled: false
  },
  modules: [
    '@nuxt/eslint',
    // '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@unocss/nuxt',  // 启用 UnoCSS 模块

    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      ga: process.env.NUXT_PUBLIC_GA
    }
  },
  icon: {
    // 可根据情况配置：
    // mode: 'auto' | 'local' | 'cdn'
    // 推荐用 'auto' 或 'cdn' 来避免本地构建限制
    mode: 'auto',
    // 配置自定义图标集合
    // 自定义icon 放在 ./src/assets/icons 文件夹下 svg, 单色图标 需要将 svg 里 fill 改成 currentColor 这样可以修改颜色
    // 使用方式  <Icon name="custom:dark" class="text-20px color-green" />
    customCollections: [
      {
        prefix: 'custom',
        dir: './src/assets/icons'
      },
    ]
  },
  generate: {
    // routes: [
    //   '/'
    // ]
  },
  build: {
    transpile: ['element-plus']
  },
  nitro: {
    preset: 'node',  // 禁用 API 路由（或根据你的需求使用其他预设）
  },
  router: {

  },
  css: [
    // 可以在这里添加 UnoCSS 的基础样式（如果需要的话）
    // 'uno.css',
    '@/assets/css/reset.css',
    '@/assets/css/var.scss',
    '@/assets/css/style.scss',
    '@/assets/css/element-plus/reset.scss'
  ],
  plugins: [
    '@/plugins/directives/index.ts', // 引入自定义指令插件
    '@/plugins/pwa-meta.client.ts', // 引入 pwa-meta 插件
    '@/plugins/i18n-sync.client.ts',
    '@/plugins/i18n-global.client.ts',
    '@/plugins/theme-init.client.ts',
    '@/plugins/api/index.ts',
    '@/plugins/vemachine-init.client.ts',
    '@/plugins/tradingview.client.ts',
  ],
  // unocss: {
  //   nuxtLayers: true,
  // },
  elementPlus: {
    importStyle: 'scss',
    themes: ['dark'],
  },

  vite: {
    plugins: [
      nodePolyfills({
        // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
        // include: ['path'],
        // // To exclude specific polyfills, add them to this list. Note: if include is provided, this has no effect
        // exclude: [
        //   'http', // Excludes the polyfill for `http` and `node:http`.
        // ],
        // // Whether to polyfill specific globals.
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          // global: false,
          // process: false,
        },
        // Override the default polyfills for specific modules.
        // overrides: {
        //   // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        //   fs: 'memfs',
        // },
        // Whether to polyfill `node:` protocol imports.
        // protocolImports: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // 修改主题色
          additionalData: '@use "~/assets/css/element-plus/index.scss";',
          api: 'modern-compiler',
        },
      }
    },
    optimizeDeps: {
      // include: ['dayjs', 'lodash-unified']
    },
    build: {
      minify: 'terser',
      sourcemap: !isProd,
      terserOptions: {
        compress: {
          drop_console: isProd, // 移除所有 console.log
        },
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    devOptions: {
      enabled: false
    },
    includeAssets: [
      'favicon.ico',
      'robots.txt',
      'apple-touch-icon.png',
      'icons/**',
    ],
    manifest: {
      name: 'Ave.ai',
      short_name: 'Ave',
      start_url: '/',
      display: 'standalone',
      background_color: '#131722',
      theme_color: '#131722',
      icons: [
        {
          src: '/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/android-chrome-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icons/android-chrome-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,json,woff2}'],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 设置为 3 MiB
    },
  },

  i18n: {
    locales: [
      { code: 'zh-cn', file: 'zh-cn.json', name: '简体中文' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'zh-tw', file: 'zh-tw.json', name: '繁體中文' },
      { code: 'es', file: 'es.json', name: 'Español' }, // { name: 'Español', subName: '(Latinoamérica)', value: 'es' },
      { code: 'pt', file: 'pt.json', name: 'Português (Brasil)' },
      { code: 'tr', file: 'tr.json', name: 'Türkçe' },
      { code: 'ru', file: 'ru.json', name: 'Русский' },
      { code: 'vi', file: 'vi.json', name: 'Tiếng Việt' },
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    lazy: true, // 懒加载语言文件
    strategy: 'no_prefix',
    langDir: './lang',
    vueI18n: './i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false
    }
  }
})
