export const usePriceV2Store = defineStore('pricev2', () => {
    const multiPriceParams = shallowRef<{
        [key: string]: string[]
    }>({
      trending: [],
        favorite: [],
        gainer: [],
    })

    function setMultiPriceParams(key: string, val: string[]) {
        multiPriceParams.value[key] = val
    }

    function sendPriceWs() {
        const wsStore = useWSStore()
        const {value} = multiPriceParams
        const ids = Array.from(
          new Set(value.trending.concat(value.favorite).concat(value.gainer).concat(useBotSwapStore().mainTokensPriceIds).concat(useGlobalStore().footerTokensPriceIds))
        )
        wsStore.send({
            jsonrpc: '2.0',
            method: 'unsubscribe',
            params: ['pricev2', ids],
            id: 1,
        })
        wsStore.send({
            jsonrpc: '2.0',
            method: 'subscribe',
            params: ['pricev2', ids],
            id: 1,
        })
    }

    return {
        setMultiPriceParams,
        sendPriceWs
    }
})
