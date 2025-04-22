// utils/i18nBridge.ts
type TranslateFn = ReturnType<typeof useI18n>['t']

let globalT: TranslateFn = (key: string) => key

export const setGlobalT = (t: TranslateFn) => {
  globalT = t
}

export const getGlobalT = () => globalT
