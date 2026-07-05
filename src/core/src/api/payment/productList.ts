import network from "../module"

type Product = {
  id: string
  title: string
  description?: string
  group_code?: string
  quantity_mode: string
  price: {
    id: number
    asset_code: string
    list_amount_minor: number
    discount_amount_minor: number
    payable_amount_minor: number
  }
}

type Response = {
  items: Array<Product>
}

type Options = {
  /**
   * `group_code` ограничивает результат товарами из одной группы каталога.
   */
  group_code?: string
  /**
   * В режиме `quantity_mode` количество приобретаемых товаров ограничено фиксированными или гибкими объемами.
   */
  quantity_mode?: string
  /**
   * `asset_code` выбирает валюту или криптовалюту, используемую для ценообразования товаров.
   */
  asset_code: string
  /**
   * Функция `locale` выбирает язык, используемый для описания товаров и изделий.
   */
  locale?: string
  /**
   * Параметр `limit` определяет максимальное количество возвращаемых товаров, до 100.
   */
  limit?: number
  /**
   * Параметр `offset` определяет, сколько совпадающих товаров будет пропущено.
   */
  offset?: number
}

async function paymentProductList(options: Options) {
  return network.send<Response>("payment.productList", options)
}

export default paymentProductList
