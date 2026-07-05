import { Mutex } from "@minsize/mutex"
import clear from "./clear"
import getSize from "./getSize"
import open from "./open"
import read from "./read"
import { write } from "./write"

export const mutex = Mutex({ globalLimit: 1 })

export const indexeddb = {
  open,
  write,
  read,
  getSize,
  clear,
}
