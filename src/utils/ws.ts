export interface WSOptions {
  url: string
  pingTimeout?: number
  reconnectLimit?: number
  pingMsg?: string
  reconnectInterval?: number
  connectTimeout?: number
  maxQueueLength?: number
  queueTimeout?: number
  onopen?: (event: Event) => void
  onclose?: (event: CloseEvent) => void
  onerror?: (event: Event) => void
  onmessage?: (event: MessageEvent) => void
}

export default class WS {
  private url: string
  private pingTimeout: number
  private reconnectLimit: number
  private pingMsg: string
  private reconnectInterval: number
  private connectTimeout: number
  private maxQueueLength: number
  private queueTimeout: number

  private ws: WebSocket | null = null
  private pingTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectCount = 0
  private forbidReconnect = false

  private reconnectMessage: Record<string, string> = {}
  private pendingQueue: { msg: string; timestamp: number }[] = []

  private onopenHandler?: WSOptions['onopen']
  private oncloseHandler?: WSOptions['onclose']
  private onerrorHandler?: WSOptions['onerror']
  private onmessageHandler?: WSOptions['onmessage']

  constructor({
    url,
    pingTimeout = 12000,
    reconnectLimit = 10,
    pingMsg = '{"jsonrpc": "2.0", "method": "ping", "id": 1}',
    reconnectInterval = 2000,
    connectTimeout = 30000,
    maxQueueLength = 100,
    queueTimeout = 15000,
    onopen,
    onclose,
    onerror,
    onmessage,
  }: WSOptions) {
    this.url = url
    this.pingTimeout = pingTimeout
    this.reconnectLimit = reconnectLimit
    this.pingMsg = pingMsg
    this.reconnectInterval = reconnectInterval
    this.connectTimeout = connectTimeout
    this.maxQueueLength = maxQueueLength
    this.queueTimeout = queueTimeout

    // 设置事件处理器
    this.onopenHandler = onopen
    this.oncloseHandler = onclose
    this.onerrorHandler = onerror
    this.onmessageHandler = onmessage

    this.createWebSocket()
  }

  private createWebSocket(reconnectMessage?: Record<string, string>) {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = (event) => {
        this.resetStatus()

        // 重新发送订阅消息
        const allMsgs = Object.values(reconnectMessage ?? this.reconnectMessage)
        for (const msg of allMsgs) {
          this.send(msg)
        }

        // 发送缓存的队列消息
        if (this.pendingQueue.length > 0) {
          this.sendQueue()
        }

        // 调用 onopen 事件处理器
        if (this.onopenHandler) {
          this.onopenHandler(event)
        }
      }

      this.ws.onmessage = (event) => {
        this.heartBeat()
        this.timeoutClose()

        if (this.onmessageHandler) {
          this.onmessageHandler(event)
        }
      }

      this.ws.onclose = (event) => {
        if (this.oncloseHandler) {
          this.oncloseHandler(event)
        }
        this.reconnect()
      }

      this.ws.onerror = (event) => {
        if (this.onerrorHandler) {
          this.onerrorHandler(event)
        }
      }

      this.timeoutClose()
    } catch (err) {
      console.error('WebSocket 创建失败', err)
      throw err
    }
  }

  private sendQueue() {
    // 批量发送队列中的消息
    const queueToSend = [...this.pendingQueue]
    this.pendingQueue = []

    queueToSend.forEach(({ msg, timestamp }) => {
      if (Date.now() - timestamp <= this.queueTimeout) {
        this.ws?.send(msg)
      }
    })
  }

  public send(msg: string | Record<string, any>) {
    let messageToSend: string

    if (typeof msg === 'string') {
      messageToSend = msg
    } else {
      try {
        messageToSend = JSON.stringify(msg)
      } catch (err) {
        console.warn('无法序列化消息:', msg, err)
        return
      }
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // 确保队列不会超出最大长度
      if (this.pendingQueue.length >= this.maxQueueLength) {
        // 删除最早的消息，避免内存泄漏
        this.pendingQueue.shift()
      }
      // 将消息与时间戳一起存入队列
      this.pendingQueue.push({ msg: messageToSend, timestamp: Date.now() })
      return
    }

    // WebSocket 已打开时直接发送消息
    this.ws.send(messageToSend)

    // 处理订阅/取消订阅消息
    if (messageToSend !== this.pingMsg) {
      try {
        const parsed = JSON.parse(messageToSend)
        const method = parsed?.method
        const event = parsed?.params?.[0]

        if (method === 'subscribe') {
          // 不删除动态键，存储订阅消息
          this.reconnectMessage[event] = messageToSend
        } else if (method === 'unsubscribe') {
          // 不删除动态键，只避免添加过时的订阅
          if (this.reconnectMessage[event]) {
            Reflect.deleteProperty(this.reconnectMessage, event)
          }
        }
      } catch {
        // 如果消息不是有效的 JSON，跳过处理
      }
    }
  }

  private heartBeat() {
    if (this.pingTimer) clearTimeout(this.pingTimer)
    this.pingTimer = setTimeout(() => {
      this.send(this.pingMsg)
      this.heartBeat()
    }, this.pingTimeout)
  }

  private timeoutClose() {
    if (this.connectTimer) clearTimeout(this.connectTimer)
    this.connectTimer = setTimeout(() => {
      if (this.ws) this.ws.close()
    }, this.connectTimeout)
  }

  private reconnect() {
    this.clearAllTimer()
    if (this.forbidReconnect) return
    if (this.reconnectCount >= this.reconnectLimit) {
      this.ws = null
      return
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.createWebSocket(this.reconnectMessage)
    }, this.reconnectInterval)
  }

  private resetStatus() {
    this.clearAllTimer()
    this.heartBeat()
    this.reconnectCount = 0
  }

  private clearAllTimer() {
    if (this.pingTimer) clearTimeout(this.pingTimer)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.connectTimer) clearTimeout(this.connectTimer)
    this.pingTimer = null
    this.reconnectTimer = null
    this.connectTimer = null
  }

  public close() {
    this.forbidReconnect = true
    this.clearAllTimer()
    this.ws?.close()
    this.ws = null
  }

  // 链式事件处理器注册
  public onopen(handler: (e: Event) => void) {
    this.onopenHandler = handler
    return this
  }

  public onclose(handler: (e: CloseEvent) => void) {
    this.oncloseHandler = handler
    return this
  }

  public onerror(handler: (e: Event) => void) {
    this.onerrorHandler = handler
    return this
  }

  public onmessage(handler: (e: MessageEvent) => void) {
    this.onmessageHandler = handler
    return this
  }
}
