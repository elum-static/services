export type ReplenishmentAsset = {
  code: string
  label: string
  decimals: number
}

export const REPLENISHMENT_ASSETS: ReplenishmentAsset[] = [
  { code: "XTR", label: "XTR", decimals: 0 },
  { code: "TON", label: "TON", decimals: 9 },
  { code: "USDT_TON", label: "USDT", decimals: 6 },
  { code: "NOT_TON", label: "NOT", decimals: 9 },
  { code: "DOGS_TON", label: "DOGS", decimals: 9 },
  { code: "MAJOR_TON", label: "MAJOR", decimals: 9 },
  { code: "UTYA_TON", label: "UTYA", decimals: 9 },
]

export const findReplenishmentAsset = (assetCode: string) =>
  REPLENISHMENT_ASSETS.find((asset) => asset.code === assetCode) || REPLENISHMENT_ASSETS[0]
