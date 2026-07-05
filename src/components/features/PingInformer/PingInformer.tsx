import style from "./PingInformer.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  onMount,
  onCleanup,
  Show,
  createEffect,
  createSignal,
} from "solid-js"

import network from "@network"
import { Badge, Cell, Flex, Group, Hidden, Text } from "src/components/ui"
import { IconWifi } from "src/source"

interface PingInformer extends JSX.HTMLAttributes<HTMLDivElement> {}

const MINIMUM_PING = 150

// FIXME : Language
const PingInformer: Component<PingInformer> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  const [when, setWhen] = createSignal(false)
  let timer: NodeJS.Timeout

  onMount(() => {
    network.startPing()
  })

  onCleanup(() => {
    network.stopPing()
  })

  createEffect(() => {
    if (network.ping >= MINIMUM_PING) {
      if (timer) {
        clearTimeout(timer)
      }
      setWhen(true)

      timer = setTimeout(() => {
        setWhen(network.ping >= MINIMUM_PING)
      }, 15_000)
    }
  })

  onCleanup(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })

  return (
    <Hidden when={when()}>
      <Group
        class={style.PingInformer}
        classList={{
          [`${local.class}`]: !!local.class,
          ...local.classList,

          [style[`PingInformer__status--warn`]]: network.ping >= MINIMUM_PING,
          [style[`PingInformer__status--success`]]: network.ping < MINIMUM_PING,
        }}
        {...others}
      >
        <Flex class={style.PingInformer__in}>
          <Cell
            separator={false}
            subTitle={
              <Text
                size={"small"}
                style={{
                  opacity: 0.8,
                }}
              >
                <Text.Content>
                  Возможна задержка. Если вы используете VPN, отключите его для комфортной игры
                </Text.Content>
              </Text>
            }
          >
            <Text>
              <Text.Badge>
                <IconWifi width={20} height={20} />
              </Text.Badge>
              <Text.Content>
                <Show when={network.ping >= MINIMUM_PING} fallback={"Стабильное соединение"}>
                  Нестабильное соединение
                </Show>
              </Text.Content>
              <Text.Badge>
                <Badge class={style.PingInformer__ping}>
                  <Text size={"small"} nowrap>
                    <Text.Content>{network.ping} мс</Text.Content>
                  </Text>
                </Badge>
              </Text.Badge>
            </Text>
          </Cell>
        </Flex>
      </Group>
    </Hidden>
  )
}

export default PingInformer
