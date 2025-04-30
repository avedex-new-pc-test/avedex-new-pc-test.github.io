import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import WS, { type WSOptions } from '@/utils/ws'
import { getBestApiDomain } from '@/plugins/api/getApiDomain'


export const useWSStore = defineStore('ws', () => {
  // 使用 shallowRef 代替 ref，WebSocket 本身是非响应式的
  const wsInstance = shallowRef<WS | null>(null)
  const isConnected = shallowRef(false)

  // 将 createWebSocket 重命名为 init
  const init = (options?: WSOptions) => {
    if (wsInstance.value) return  // 防止重复创建 WebSocket 实例
    const url = `${(getBestApiDomain() || location.origin).replace('http', 'ws')}/ws`
    wsInstance.value = new WS({url, ...(options || {})})

    wsInstance.value.onopen(() => {
      isConnected.value = true
    }).onmessage(e => {
      console.log(e)
    }).onclose(() => {
      isConnected.value = false
    })
  }


  // 发送消息并确保初始化 WebSocket 连接
  const send = (msg: string | Record<string, any>, options?: WSOptions) => {
    if (!wsInstance.value) {
      // 如果 WebSocket 未初始化，则自动调用 init 初始化
      const url = `${(getBestApiDomain() || location.origin).replace('http', 'ws')}/ws`
      init(options || { url: url })  // 默认空 URL，或者你可以传递默认的初始化选项
    }
    wsInstance.value?.send(msg)
    return wsInstance.value
  }

  const close = () => {
    isConnected.value = false
    wsInstance.value?.close()
    wsInstance.value = null
  }

  return {
    wsInstance,
    isConnected,
    init,
    send,
    close
  }
})
