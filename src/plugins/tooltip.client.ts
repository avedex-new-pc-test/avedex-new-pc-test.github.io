// src/plugins/tooltip.client.ts
import { h, render, ref, shallowRef, nextTick } from 'vue'
import ElTooltip from 'element-plus/es/components/tooltip'
import 'element-plus/es/components/tooltip/style/index'

// 定义类型
export interface TooltipContentComponent {
  is: any
  props?: Record<string, any>
}

export type TooltipContent =
  | string
  | (() => any)
  | TooltipContentComponent
  | any // fallback, e.g., VNode or h()

export interface TooltipOptions {
  content: TooltipContent
  target: HTMLElement
  props?: Record<string, any>
}

export interface TooltipInstance {
  show: (options: TooltipOptions) => void
  hide: () => void
}

export interface Measurable {
  getBoundingClientRect: () => DOMRect
}

export default defineNuxtPlugin((nuxtApp) => {
  let mounted = false
  const visible = ref(false)
  const content = shallowRef<TooltipContent | null>(null)
  const triggerRef = shallowRef<HTMLElement | null>(null)
  const tooltipProps = shallowRef<Record<string, any>>({})

  let container: HTMLDivElement | null = null

  function mountTooltip() {
    if (mounted) return

    const TooltipWrapper = {
      setup() {
        return () =>
          h(
            ElTooltip,
            {
              visible: visible.value,
              virtualRef: triggerRef.value as Measurable | undefined,
              virtualTriggering: true,
              ...tooltipProps.value,
            },
            {
              content: () => {
                const val = content.value
                if (!val) return '—'
                if (typeof val === 'string') {
                  if (
                    tooltipProps.value['raw-content'] ||
                    tooltipProps.value['rawContent']
                  ) {
                    return h('div', { innerHTML: val })
                  }
                  return val
                }
                if (typeof val === 'function') return val(h)
                if (typeof val === 'object' && val.is) {
                  const Component = val.is
                  const props = val.props || {}
                  return h(Component, props)
                }
                return h(val)
              },
            }
          )
      },
    }

    container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = h(TooltipWrapper)
    vnode.appContext = nuxtApp.vueApp._context
    render(vnode, container)

    mounted = true
  }

  const tooltip: TooltipInstance = {
    show({ content: c, target, props = {} }) {
      if (!target) {
        console.error('Target element is required for tooltip')
        return
      }

      triggerRef.value = target
      content.value = c
      tooltipProps.value = props

      nextTick(() => {
        if (!triggerRef.value || !triggerRef.value.parentNode) {
          console.error('Invalid trigger element')
          return
        }
        mountTooltip()
        visible.value = true
      })
    },
    hide() {
      visible.value = false
    },
  }

  // 挂载到全局属性
  nuxtApp.vueApp.config.globalProperties.$tooltip = tooltip
})
