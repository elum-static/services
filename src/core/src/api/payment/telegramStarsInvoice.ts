import network from "../module"

type Response = {
  order_id: number
  order_public_id: string
  attempt_id: number
  invoice_link: string
  amount_minor: number
  asset_code: string
}

type Options = {
  id: string
  quantity?: number
  operation_id: string
  locale?: string
}

async function paymentTelegramStarsInvoice(options: Options) {
  if (!options.quantity) {
    options.quantity = 1
  }

  return network.send<Response>("payment.telegramStarsInvoice", options)
}

export default paymentTelegramStarsInvoice
