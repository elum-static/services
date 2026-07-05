import { createMemo } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"

import {
  type Flatten,
  type NullableTranslator,
  Translator,
  flatten,
  resolveTemplate,
  translator,
} from "./module"

/**
 * Импорт языков
 */
import ru from "./data/ru"
import en from "./data/en"
import ua from "./data/uk"

import checker from "./module/checker"

type MergeDictionaries<T extends Record<string, Record<string, any>>> = T[keyof T]

const dictionaries = { ru, en, ua }
const defaultLanguage: keyof typeof dictionaries = "en"

type Store = {
  selected: keyof typeof dictionaries
}

class Locale<T extends typeof dictionaries> {
  private store: Store
  protected setStore: SetStoreFunction<Store>

  constructor() {
    checker(dictionaries)

    const [store, setStore] = createStore<Store>({ selected: defaultLanguage })

    this.store = store
    this.setStore = setStore
  }

  /**
   * Создает реактивные примитивы для использования перевода в компонентах Solid.js
   * @returns Массив из двух элементов:
   *  - translator: функция для перевода ключей с поддержкой шаблонов
   *  - getter: accessor для получения текущей выбранной локали
   */
  public use() {
    // Мемоизированный computed-значение: уплощенный словарь для текущей локали
    const dict = createMemo(() => flatten(dictionaries[this.store.selected]))

    return [translator(dict, resolveTemplate), this.store.selected] as [
      Translator<Flatten<(typeof dictionaries)[keyof typeof dictionaries]>>,
      keyof T,
    ]
  }

  /**
   * Переключает текущий язык на указанный
   * @param key - Ключ языка (должен существовать в locales)
   * @example
   * locale.swap('ru')  // Переключится на русский
   * locale.swap('en')  // Переключится на английский
   */
  public swap(key: Store["selected"]) {
    if (!key || !dictionaries?.[key]) {
      console.error(`Нет такого перевода: "${String(key)}"`)
      return
    }

    this.setStore("selected", key)
  }
}

export default Locale
