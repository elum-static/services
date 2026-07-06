import { createStore } from "solid-js/store"
import style from "./Replenishment.module.css"

import { type JSX, type Component, For, Show, createEffect, createMemo, onMount } from "solid-js"
import { Button, Flex, Header, Modal, Text } from "src/components/ui"
import core from "src/core"
import { IconStars } from "src/source"
import { clamp } from "@minsize/utils"
import { findReplenishmentAsset } from "./assets"

interface Replenishment extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}

type Store = {
  value: number
  assetCode: string
  productID: string
  products: Product[]
  loading: boolean
  paying: boolean
  error: string
}

type Product = {
  id: string
  title: string
  description?: string
  quantity_mode: string
  price: {
    asset_code: string
    payable_amount_minor: number
  }
}

const formatAssetAmount = (minor: number, decimals: number) => {
  const value = minor / 10 ** decimals

  return value.toLocaleString("ru-RU", {
    maximumFractionDigits: decimals,
  })
}

// FIXME: Language
const Replenishment: Component<Replenishment> = (props) => {
  const initialAssetCode = findReplenishmentAsset(core.route.getReplenishmentAssetCode()).code
  const [store, setStore] = createStore<Store>({
    value: 0,
    assetCode: initialAssetCode,
    productID: "",
    products: [],
    loading: false,
    paying: false,
    error: "",
  })

  const selectedProduct = createMemo(() =>
    store.products.find((product) => product.id === store.productID),
  )
  const selectedAsset = createMemo(() => findReplenishmentAsset(store.assetCode))
  const paymentAmountMinor = createMemo(() => {
    const product = selectedProduct()

    if (!product || !store.value) {
      return 0
    }

    return product.price.payable_amount_minor * store.value
  })

  const loadProducts = async (assetCode: string) => {
    setStore("loading", true)
    setStore("error", "")

    try {
      const { response, error } = await core.api.payment.productList({
        asset_code: assetCode,
        quantity_mode: "flexible",
        locale: "ru",
        limit: 20,
      })

      if (error || !response) {
        setStore("products", [])
        setStore("productID", "")
        setStore("error", "Не удалось загрузить товары для пополнения")
        return
      }

      setStore("products", response.items)
      setStore("productID", response.items[0]?.id || "")
    } finally {
      setStore("loading", false)
    }
  }

  const pay = async () => {
    const product = selectedProduct()

    if (!core.tonConnect.connected) {
      await bindWallet()
      return
    }

    if (!product || !store.value || store.paying) {
      return
    }

    setStore("paying", true)
    setStore("error", "")

    try {
      const sourceWallet = core.tonConnect.address

      if (!sourceWallet) {
        setStore("error", "Не удалось получить адрес привязанного кошелька")
        return
      }

      const { response, error } = await core.api.payment.cryptoTransaction({
        id: product.id,
        asset_code: store.assetCode,
        quantity: store.value,
        source_wallet: sourceWallet,
        locale: "ru",
      })

      if (error || !response) {
        setStore("error", "Не удалось создать платёж")
        return
      }

      await core.tonConnect.sendTransaction(response.transaction)
      core.state.balance.refresh()
      core.route.goBack()
    } catch (error) {
      console.error("[replenishment] TON payment failed", error)
      setStore("error", "Платёж не был отправлен")
    } finally {
      setStore("paying", false)
    }
  }

  const bindWallet = async () => {
    if (store.paying) {
      return
    }

    setStore("paying", true)
    setStore("error", "")

    try {
      const account = await core.tonConnect.connect()

      if (!account) {
        setStore("error", "Не удалось привязать кошелёк")
      }
    } catch (error) {
      console.error("[replenishment] TON wallet binding failed", error)
      setStore("error", "Кошелёк не был привязан")
    } finally {
      setStore("paying", false)
    }
  }

  onMount(() => {
    core.tonConnect.restore()
  })

  createEffect(() => {
    loadProducts(store.assetCode)
  })

  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
      <Header type={"modal"}>
        <Header.Group>
          <Header.Content type={"content"}>
            <Header.Content.Background>
              <Text>
                <Text.Content>Пополнение баланса</Text.Content>
              </Text>
            </Header.Content.Background>
          </Header.Content>
          <Header.Content type={"after"}>
            <Header.BackButton type={"close"} onClick={() => core.route.goBack()} />
          </Header.Content>
        </Header.Group>
      </Header>

      <Flex
        padding={"10px"}
        gap={"10px"}
        direction={"column"}
        style={{
          width: "100%",
          "box-sizing": "border-box",
        }}
      >
        <Show when={store.products.length > 1}>
          <Flex gap={"8px"} direction={"row"} wrap={"wrap"} style={{ width: "100%" }}>
            <For each={store.products}>
              {(product) => (
                <Button
                  size={"small"}
                  appearance={store.productID === product.id ? "accent" : "secondary"}
                  onClick={() => setStore("productID", product.id)}
                >
                  <Button.Content>
                    <Text color={"inherit"} align={"center"} size={"small"}>
                      <Text.Content>{product.title || product.id}</Text.Content>
                    </Text>
                  </Button.Content>
                </Button>
              )}
            </For>
          </Flex>
        </Show>

        <Flex gap={"16px"} direction={"row"}>
          <IconStars width={64} height={64} />
          <input
            class={style.Replenishment__input}
            value={store.value || ""}
            onInput={(event) => {
              const oldValue = store.value?.toString() || ""
              let rawValue = event.target.value

              const isDeleting = rawValue.length < oldValue.length

              // Убираем всё кроме цифр
              let numericValue = rawValue.replace(/\D/g, "")

              // Преобразуем в число
              let numberValue = numericValue === "" ? 0 : parseInt(numericValue, 10)

              // Ограничиваем
              if (numberValue > 100_000) {
                numberValue = 100_000
              }

              if (!isDeleting && numberValue <= 0) {
                numberValue = 1
              }

              event.target.value = String(numberValue || "")
              setStore("value", numberValue)
            }}
            maxLength={6}
            placeholder={"100"}
            type={"number"}
            min={"0"}
            max={"100000"}
            step={"1"}
          />
        </Flex>
        <Flex padding={"0px 10px"} style={{ width: "100%", "box-sizing": "border-box" }}>
          <Text color={"secondary"} size={"small"}>
            <Text.Content>
              К оплате: {formatAssetAmount(paymentAmountMinor(), selectedAsset().decimals)}{" "}
              {selectedAsset().label}
            </Text.Content>
          </Text>
        </Flex>
        <Flex padding={"0px 10px"} gap={"4px"} direction={"column"}>
          <Text color={"secondary"} size={"small"}>
            <Text.Content>
              {core.tonConnect.connected ? "Привязанный кошелёк" : "Сначала привяжите TON кошелёк"}
            </Text.Content>
          </Text>
          <Show when={core.tonConnect.connected}>
            <Text size={"small"}>
              <Text.Content>
                {core.tonConnect.walletName ? `${core.tonConnect.walletName}: ` : ""}
                {core.tonConnect.shortAddress}
              </Text.Content>
            </Text>
          </Show>
        </Flex>
        <Show when={store.error}>
          <Flex padding={"0px 10px"} style={{ width: "100%", "box-sizing": "border-box" }}>
            <Text color={"red"} size={"small"}>
              <Text.Content>{store.error}</Text.Content>
            </Text>
          </Flex>
        </Show>

        <Flex class={style.Replenishment__placeholder} gap={"4px"}>
          <Text align={"center"} size={"small"}>
            <Text.Content>+20% бонусных звёзд от 50</Text.Content>
          </Text>
          <Text align={"center"} size={"x-small"}>
            <Text.Content>Максимум 100 бонусных звёзд за одно пополнение</Text.Content>
          </Text>
          <Text align={"center"} size={"x-small"}>
            <Text.Content>
              С текущей суммы: +{parseFloat(clamp(store.value * 0.2, 0, 100).toFixed(2)).toString()}{" "}
              бонусных звёзд
            </Text.Content>
          </Text>
        </Flex>
      </Flex>

      <Button.Group>
        <Button.Group.Container>
          <For each={[100, 500, 1000]}>
            {(count) => (
              <Button
                size={"small"}
                stretched
                appearance={"secondary"}
                onClick={() => {
                  setStore("value", (value) => clamp(value + count, 0, 100_000))
                }}
              >
                <Button.Content>
                  <Text color={"inherit"} align={"center"}>
                    <Text.Content>+ {count}</Text.Content>
                  </Text>
                </Button.Content>
              </Button>
            )}
          </For>
        </Button.Group.Container>
        <Button.Group.Container>
          <Button
            size={"large"}
            stretched
            loading={
              store.loading ||
              store.paying ||
              core.tonConnect.restoring ||
              core.tonConnect.connecting
            }
            disabled={core.tonConnect.connected && (!selectedProduct() || !store.value)}
            onClick={pay}
          >
            <Button.Content>
              <Text color={"inherit"} align={"center"}>
                <Text.Content>
                  {core.tonConnect.connected
                    ? `Пополнить через ${selectedAsset().label}`
                    : "Привязать кошелёк"}
                </Text.Content>
              </Text>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Modal>
  )
}

export default Replenishment
