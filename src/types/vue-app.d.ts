// types/vue-app.d.ts
import type { PopoverInstance } from '~/plugins/popover.client'
import type { TooltipInstance } from '~/plugins/tooltip.client'

declare module '#app' {
  interface NuxtApp {
    $popover: PopoverInstance
    $tooltip: TooltipInstance
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $popover: PopoverInstance
    $tooltip: TooltipInstance
  }
}
