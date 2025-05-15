import { useBotStore } from '../stores/bot'
// 用户备注
let remarksInstance:any = null
export function useRemarks() {
    const botStore = useBotStore()
  // 如果已经有实例，直接返回
  if (remarksInstance) {
    return remarksInstance
  }
  const self_address = computed(() => botStore.evmAddress)
  let remarks = useLocalforage(`ave_remark_${self_address.value}`, [])
  const remarkObj = computed(() => {
    const obj = {}
    remarks.value.forEach((i) => {
      obj[i.user_address + '-' + i.user_chain] = i.remark
    })
    return obj
  })

  function updateRemark({ user_address, remark, user_chain, self_address }) {
    if (user_address) {
      const arr = remarks.value.filter(
        (i) => !(i.user_address === user_address && i.user_chain === user_chain)
      )
      if (remark) {
        arr.unshift({
          user_address,
          remark,
          user_chain,
          self_address,
        })
      }
      remarks.value = arr?.map?.((i) => ({ ...i })) || []
    }
  }

  function getRemarks() {
    getFavUserRemarks({ address: self_address.value }).then((res) => {
      remarks.value = res || []
    })
  }

  function watchSelfAddress() {
    watch(self_address, () => {
      remarks = useLocalforage(`ave_remark_${self_address.value}`, [])
      getRemarks()
    })
  }

  function initRemarks() {
    getRemarks()
    watchSelfAddress()
  }

  function getRemarkByAddress({ address, chain }) {
    // return remark.value.filter((i) => i.user_address === address && i.user_chain === chain)
    if (!address || !chain) {
      return ''
    }
    return remarkObj.value?.[address + '-' + chain] || ''
  }

  // 保存单例实例
  remarksInstance = {
    remarks,
    updateRemark,
    getRemarks,
    watchSelfAddress,
    initRemarks,
    getRemarkByAddress,
  }

  return remarksInstance
}
