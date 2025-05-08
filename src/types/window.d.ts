import type { ChartingLibraryWidgetConstructor } from './tradingview/charting_library'
export {}

declare global {
  interface Window {
    TradingView: {
      widget: ChartingLibraryWidgetConstructor
    }
  }
}
