export default defineNuxtPlugin({
  name: 'vemachine-init',
  enforce: 'pre', // 确保在应用初始化前运行

  async setup() {
    if (import.meta.client) {
      // 等待 DOM 和外部 script 加载
      await nextTick()

      // 防止 vemachine 未加载报错
      const w: Window & {
        vemachine?: {
          generateToken?: (arg?: boolean) => Promise<string>
        }
      } = window
      if (typeof w !== 'undefined' && w?.vemachine?.generateToken) {
        try {
          await w?.vemachine?.generateToken?.()
          console.log('[vemachine] token generated')
        } catch (err) {
          console.error('[vemachine] failed to generate token', err)
        }
      } else {
        console.warn('[vemachine] not loaded')
      }
    }
  }
})
