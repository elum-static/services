import cryptoTransaction from "./cryptoTransaction"
import productGet from "./productGet"
import productList from "./productList"

class Payment {
  public productGet = productGet
  public productList = productList
  public cryptoTransaction = cryptoTransaction
}

export default Payment
