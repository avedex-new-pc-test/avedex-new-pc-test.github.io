// plugins/pwa-meta.client.ts

export default defineNuxtPlugin(() => {
  useHead({
    link: [
      // Favicon
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/favicon-16x16.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32x32.png' },

      // Apple Touch Icons
      { rel: 'apple-touch-icon', sizes: '60x60', href: '/icons/apple-touch-icon-60x60.png' },
      { rel: 'apple-touch-icon', sizes: '76x76', href: '/icons/apple-touch-icon-76x76.png' },
      { rel: 'apple-touch-icon', sizes: '120x120', href: '/icons/apple-touch-icon-120x120.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/icons/apple-touch-icon-152x152.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon-180x180.png' },
      { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },

      // Safari pinned tab
      { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#131722' },

      // Manifest
      { rel: 'manifest', href: '/manifest.webmanifest' }
    ],
    meta: [
      { name: 'theme-color', content: '#131722' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes'},
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'msapplication-TileColor', content: '#131722' },
      { name: 'msapplication-TileImage', content: '/icons/mstile-150x150.png' }
    ]
  })
})
