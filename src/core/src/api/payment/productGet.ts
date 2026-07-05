import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  /**
   * Идентификатор определяет товар, подлежащий возврату.
   */
  id: string
  /**
   * `asset_code` выбирает валюту или криптовалюту, используемую для определения цены продукта.
   */
  asset_code: string
  /**
   * Функция `locale` выбирает язык, используемый для описания товаров и изделий.
   */
  locale?: string
}

// FIXME: Описание
async function paymentProductGet(options: Options) {
  return network.send<Response>("payment.productGet", options)
}

export default paymentProductGet
