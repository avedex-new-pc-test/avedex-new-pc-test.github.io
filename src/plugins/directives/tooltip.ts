import type { Directive, DirectiveBinding } from 'vue'
import type { ElTooltipProps } from 'element-plus'

interface HTMLElementDirective extends HTMLElement {
  __tooltipHandlers?: {
    onMouseEnter: (e: MouseEvent) => void
    onMouseLeave: (e: MouseEvent) => void
  }
}

type TooltipValue =
  | string
  | {
    content:
    | string
    | ((h: typeof import('vue').h) => any)
    | { is: any; props?: Record<string, any> }
    | any
    props?: Partial<ElTooltipProps> & {
      'raw-content'?: boolean
      'popper-class'?: string
    }
  }

interface TooltipController {
  show: (options: {
    content: any
    target: HTMLElementDirective
    props?: Partial<ElTooltipProps> & {
      ['raw-content']?: boolean
      ['popper-class']?: string
    }
  }) => void
  hide: () => void
}


function resolveTooltip(el: HTMLElementDirective): TooltipController | undefined {
  const {$tooltip} = useNuxtApp()
  const instance = (el as any).__vueParentComponent?.proxy
  return instance?.$tooltip || (el as any).__app?.config?.globalProperties?.$tooltip || $tooltip
}

const tooltipDirective: Directive<HTMLElementDirective, TooltipValue> = {
  mounted(el, binding: DirectiveBinding<TooltipValue>) {
    const tooltip = resolveTooltip(el)

    if (!tooltip) {
      console.warn('Tooltip instance not found')
      return
    }

    const raw = binding.modifiers?.raw ?? false
    const value = binding.value

    const showTooltip = () => {
      let content: any = value
      let props: Partial<ElTooltipProps> & {
        'raw-content'?: boolean
        'popper-class'?: string
      } = {}

      // 更新后的判断逻辑
      if (
        typeof value === 'object' &&
        value !== null &&
        !(value as any).render && // 不具有 render 属性，避免与组件冲突
        !(value as any).setup && // 不具有 setup 属性
        !(value as any).is && // 不具有 is 属性
        typeof value !== 'function' // 不是函数
      ) {
        content = (value as any)?.content
        props = (value as any)?.props || {}
      }

      if (raw) {
        props['raw-content'] = true
      }

      tooltip.show({
        content,
        target: el,
        props: {
          // effect: 'customized',
          placement: 'top',
          'popper-class': props?.['popper-class'] || '',
          ...props,
        },
      })
    }

    const hideTooltip = () => {
      tooltip.hide()
    }

    const onMouseEnter = (e: MouseEvent) => {
      e.stopPropagation()
      showTooltip()
    }

    const onMouseLeave = (e: MouseEvent) => {
      e.stopPropagation()
      hideTooltip()
    }

    el.__tooltipHandlers = { onMouseEnter, onMouseLeave }

    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)
  },

  unmounted(el) {
    const { onMouseEnter, onMouseLeave } = el.__tooltipHandlers || {}
    if (onMouseEnter) {
      el.removeEventListener('mouseenter', onMouseEnter)
    }

    if (onMouseLeave) {
      el.removeEventListener('mouseleave', onMouseLeave)
    }
    delete el.__tooltipHandlers
  },
}

export default tooltipDirective
