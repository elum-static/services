import { createStore, type SetStoreFunction } from "solid-js/store"
import type { Account, ConnectedWallet, TonConnectUI } from "@tonconnect/ui"

type TONTransaction = {
  address: string
  amount: string
  payload?: string
}

type Store = {
  restoring: boolean
  connecting: boolean
  connected: boolean
  address: string
  chain: string
  walletName: string
}

class TonConnect {
  private ui: TonConnectUI | undefined
  private unsubscribe: (() => void) | undefined
  private store: Store
  private setStore: SetStoreFunction<Store>

  constructor() {
    const [store, setStore] = createStore<Store>({
      restoring: false,
      connecting: false,
      connected: false,
      address: "",
      chain: "",
      walletName: "",
    })

    this.store = store
    this.setStore = setStore
  }

  private getManifestURL() {
    return new URL(
      `${import.meta.env.VITE_BASE_DIR || "/"}tonconnect-manifest.json`,
      window.location.origin,
    ).href
  }

  private formatAddress(address: string) {
    if (!address) {
      return ""
    }

    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  private updateState(account: Account | null, wallet: ConnectedWallet | null) {
    this.setStore({
      connected: !!account,
      address: account?.address || "",
      chain: account?.chain || "",
      walletName: wallet?.name || wallet?.appName || "",
    })
  }

  private async getUI() {
    if (!this.ui) {
      const { TonConnectUI } = await import("@tonconnect/ui")

      this.ui = new TonConnectUI({
        manifestUrl: this.getManifestURL(),
        uiPreferences: {
          theme: "SYSTEM",
          borderRadius: "s",
        },
        language: "ru",
      })

      this.unsubscribe = this.ui.onStatusChange((wallet) => {
        this.updateState(this.ui?.account || null, wallet)
      })

      this.setStore("restoring", true)
      this.ui.connectionRestored
        .then(() => {
          this.updateState(this.ui?.account || null, this.ui?.wallet || null)
        })
        .finally(() => {
          this.setStore("restoring", false)
        })
    }

    return this.ui
  }

  public async restore() {
    await this.getUI()
  }

  public get connected() {
    return this.store.connected
  }

  public get connecting() {
    return this.store.connecting
  }

  public get restoring() {
    return this.store.restoring
  }

  public get address() {
    return this.store.address
  }

  public get shortAddress() {
    return this.formatAddress(this.store.address)
  }

  public get walletName() {
    return this.store.walletName
  }

  public async connect() {
    const ui = await this.getUI()

    if (ui.connected) {
      this.updateState(ui.account, ui.wallet)
      return ui.account
    }

    this.setStore("connecting", true)

    try {
      await ui.connectWallet()
      this.updateState(ui.account, ui.wallet)
      return ui.account
    } finally {
      this.setStore("connecting", false)
    }
  }

  public async disconnect() {
    const ui = await this.getUI()

    if (ui.connected) {
      await ui.disconnect()
    }

    this.updateState(null, null)
  }

  public async sendTransaction(transaction: TONTransaction) {
    const ui = await this.getUI()

    if (!ui.connected) {
      await this.connect()
    }

    return ui.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: transaction.address,
          amount: transaction.amount,
          payload: transaction.payload,
        },
      ],
    })
  }

  public destroy() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
  }
}

export default TonConnect
