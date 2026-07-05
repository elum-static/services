import network from "../module"

type Payment = {
  order_id: number
  order_public_id: string
  attempt_id: number
  wallet_address: string
  network: string
  asset_code: string
  amount_minor: number
  comment: string
  decimals: number
  provider_status: string
}

type Transaction = {
  kind: string
  address: string
  amount: string
  payload?: string
}

type Response = {
  payment: Payment
  transaction: Transaction
}

type Options = {
  /**
   * `id` определяет приобретаемый товар.
   */
  id: string
  /**
   * `asset_code` выбирает TON или поддерживаемый TON jetton, используемый для оплаты.
   */
  asset_code: string
  /**
   * Параметр `quantity` определяет, сколько единиц товара приобретается.
   *
   * @default 1
   */
  quantity?: number
  /**
   * `locale` выбирает язык, используемый при обработке данных о продукте.
   */
  locale?: string
}

async function paymentCryptoTransaction(options: Options) {
  if (!options.quantity) {
    options.quantity = 1
  }

  return network.send<Response>("payment.cryptoTransaction", options)
}

export default paymentCryptoTransaction
