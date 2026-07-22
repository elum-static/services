import cryptoTransaction from "./cryptoTransaction"
import productGet from "./productGet"
import productList from "./productList"
import telegramStarsInvoice from "./telegramStarsInvoice"

class Payment {
  public productGet = productGet
  public productList = productList
  public cryptoTransaction = cryptoTransaction
  public telegramStarsInvoice = telegramStarsInvoice
}

export default Payment
