import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  refreshAccessToken as _refAcc,
  login,
  bot_getWalletsAllChain,
  bot_getWebConfig,
  bot_updateWebConfig,
} from "@/api/bot";
import { createCacheRequest } from "@/utils/cacheRequest";
import { tgLogin } from "@/utils/bot";
import { useBotSettingStore } from "./botSetting";
import { deepMerge } from "@/utils";

const _refreshAccessToken = createCacheRequest(_refAcc, 3000);

export const useBotStore = defineStore("bot", () => {
  const isSupportChains = ["eth", "bsc", "solana", "base"];
  const accessToken = useLocalStorage("bot_accessToken", "");
  const refreshToken = useLocalStorage("bot_refreshToken", "");
  const evmAddress = useLocalStorage("bot_evmAddress", "");
  const botReqCount = ref(0);
  const refreshing = ref(false);

  const connectVisible = ref(false);
  const connectWalletTab = ref(0);
  const chainId = ref(Number(localStorage.chainId));
  if (isNaN(chainId.value)) {
    chainId.value = Number(localStorage.chainId);
  }
  chainId.value =
    localStorage.currentWallet === "importAddress" ||
    isSolanaChain() ||
    localStorage.currentWallet === "TronLink"
      ? chainId.value || 0
      : 0;

  const currentAccount = ref(
    localStorage.currentWallet === "importAddress" ||
    isSolanaChain() ||
    localStorage.currentWallet === "TronLink"
      ? localStorage?.currentAccount?.replace?.(/"|'/g, "") || ""
      : ""
  );
  const wallet = useLocalStorage("currentWallet", "");
  const provider = ref('')
  const signatureObj= useLocalStorage('signatureObj',{})
  const walletList = shallowRef<
    Awaited<ReturnType<typeof bot_getWalletsAllChain>>
  >([]);
  console.log("=>(bot.ts:19) walletList", walletList);
  const userInfo = computed(() => {
    return walletList.value?.find?.((i) => i.evmAddress === evmAddress.value);
  });
  function setProvider(provider: any) {
      provider.value = provider
  }
  function isSolanaChain() {
    return localStorage?.currentWallet?.includes("Solana") || false;
  }
  function refreshAccessToken(type: "acc" | "ref") {
    if (!refreshToken.value) {
      return Promise.reject("no refreshToken");
    }
    return _refreshAccessToken(type).then((res) => {
      if (res?.accessToken) {
        accessToken.value = res.accessToken;
      }
      if (res?.refreshToken) {
        refreshToken.value = res.refreshToken;
      }
    });
  }
  function getUserInfo(evmAddress1 = "") {
    if (accessToken.value) {
      bot_getWalletsAllChain({ chain: isSupportChains?.join(",") }).then(
        (res) => {
          walletList.value = res || [];
          if (evmAddress1) {
            const item = walletList.value?.find?.(
              (i) => i.evmAddress === evmAddress1
            );
            if (item) {
              evmAddress.value = evmAddress1;
            } else {
              evmAddress.value = walletList.value?.[0]?.evmAddress || "";
            }
          } else {
            const isWallet = walletList.value?.find?.(
              (i) =>
                evmAddress.value === i?.evmAddress &&
                userInfo.value?.addresses?.length === i?.addresses?.length
            );
            if (!isWallet) {
              evmAddress.value = walletList.value?.[0]?.evmAddress || "";
            }
          }
          // 获取用户交易配置信息
          getWebConfig();
          // 获取用户其他信息
        }
      );
    }
  }
  function setSignatureObj(obj: {} | null | undefined) {
      signatureObj.value = obj
  }
  function setChainId(val: number) {
      chainId.value = val
  }
  function getWebConfig(chain = "") {
    if (accessToken.value) {
      return bot_getWebConfig(chain).then((res) => {
        const botSettings = useBotSettingStore().botSettings;
        if (chain) {
          botSettings[chain] = deepMerge(botSettings[chain], res);
        } else {
          botSettings.value = deepMerge(botSettings.value, res);
        }
        return botSettings.value;
      });
    }
  }
  function setCurrentAccount(val:string) {
      console.log('setCurrentAccount', currentAccount.value, chainId.value)
      if (!isNaN(Number(chainId))) {
        currentAccount.value = val.toLowerCase()
      } else {
        currentAccount.value = val
      }
      if (
        localStorage.currentAccount !== currentAccount.value &&
        (localStorage.currentWallet === 'importAddress' || isSolanaChain())
      ) {
        localStorage.currentAccount = currentAccount.value?.replace(/"|'/g, '')
      }
      if (val) {
        accessToken.value = ''
        // localStorage.bot_accessToken = ''
        refreshToken.value = ''
        // localStorage.bot_refreshToken = ''
        // userInfo.value = {
        //   tgUid:  '',
        // }
        localStorage.bot_userInfo = ''
      }
  }
  let Timer: ReturnType<typeof setTimeout> | null = null;
  function updateWebConfig(data: { chain?: string; webConfig?: string } = {}) {
    if (!accessToken.value) {
      return;
    }

    // 添加防抖
    if (Timer) {
      clearTimeout(Timer);
      Timer = null;
    }
    Timer = setTimeout(() => {
      bot_updateWebConfig(data);
    }, 1500);
  }

  function _login(data: Parameters<typeof login>[0]) {
    login(data).then((res) => {
      accessToken.value = res.accessToken;
      refreshToken.value = res.refreshToken;
      evmAddress.value = res.evmAddress;
      getUserInfo();
    });
  }

  function logout() {
    accessToken.value = "";
    refreshToken.value = "";
    evmAddress.value = "";
  }

  function getWalletAddress(chain: string) {
    if (Array.isArray(userInfo.value?.addresses)) {
      return userInfo.value.addresses.find((el) => el.chain === chain)?.address;
    }
    return evmAddress.value;
  }
  function changeConnectVisible(visible: boolean, tab?: number): void {
    connectVisible.value = visible;
    connectWalletTab.value = tab ?? 0;
  }
  return {
    chainId,
    currentAccount,
    accessToken,
    wallet,
    provider,
    walletList,
    refreshToken,
    botReqCount,
    refreshing,
    evmAddress,
    connectVisible,
    userInfo,
    refreshAccessToken,
    logout,
    login: _login,
    tgLogin,
    getUserInfo,
    getWebConfig,
    updateWebConfig,
    isSupportChains,
    getWalletAddress,
    changeConnectVisible,
    connectWalletTab,
    setSignatureObj,
    setCurrentAccount,
    setProvider,
    setChainId,
    signatureObj
  };
});
