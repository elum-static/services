import { TELEGRAM_MODELS, type TelegramFiles } from "./types"

const localsFilesTGS = ["crush", "boom", "mine", "star"] as const

class Files {
  private url: string = "https://s3.apiteam.ru"

  constructor() {}

  public getNames() {
    return TELEGRAM_MODELS
  }

  getTGS<A extends keyof TelegramFiles>(name: (typeof localsFilesTGS)[number]): URL
  getTGS<A extends keyof TelegramFiles>(name: A, pattern: TelegramFiles[A][number]): URL
  public getTGS<A extends keyof TelegramFiles>(name: A, pattern?: TelegramFiles[A][number]) {
    if (localsFilesTGS.includes(name as any)) {
      return new URL(encodeURI(`/lottie/${name}.tgs`), import.meta.url)
    }
    return new URL(encodeURI(`${this.url}/telegram/tgs/models/${name}/${pattern}.tgs`))
  }

  public getWEBP<A extends keyof TelegramFiles>(
    name: A,
    pattern: TelegramFiles[A][number],
    size: "small" | "medium" | "original",
  ) {
    return new URL(encodeURI(`${this.url}/telegram/${size}/models/${name}/webp/${pattern}.webp`))
  }
}

export default Files
