import style from "./IconLanguage.module.css"
import { Locale } from "src/core/src/languages"
import { type JSX, type Component, mergeProps, splitProps, Switch, Match } from "solid-js"
import {
  IconLanguageEn,
  IconLanguageRu,
  IconLanguageUk,
  IconLanguage as SIconLanguage,
} from "src/source"

interface IconLanguage extends JSX.HTMLAttributes<HTMLDivElement> {
  region: Locale
  size?: number
}

const IconLanguage: Component<IconLanguage> = (props) => {
  const merged = mergeProps({ size: 24 }, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "region", "size"])

  return (
    <Switch fallback={<SIconLanguage />}>
      <Match when={local.region === "en"}>
        <IconLanguageEn width={local.size} height={local.size} />
      </Match>
      <Match when={local.region === "uk"}>
        <IconLanguageUk width={local.size} height={local.size} />
      </Match>
      <Match when={local.region === "ru"}>
        <IconLanguageRu width={local.size} height={local.size} />
      </Match>
    </Switch>
  )
}

export default IconLanguage
