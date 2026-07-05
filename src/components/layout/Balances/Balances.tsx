import { Events, Flex, FlexProps } from "src/components/ui"
import style from "./Balances.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import core from "src/core"
import { IconBonusStar, IconLighting, IconStars } from "src/source"
import { AnimationNumber } from "src/components/features"

interface Balances extends FlexProps<"section"> {}

const Balances: Component<Balances> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <Flex
      class={style.Balances}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      direction={"row"}
      // padding={"16px"}
      gap={"10px"}
    >
      <Events class={style.Balances__item} pressTransform onClick={core.route.goSeason.default}>
        <Flex direction={"row"} gap={"2px"}>
          <IconLighting width={18} height={18} />
          <AnimationNumber
            value={core.api.balance.getTransform(core.state.balance.lightning)}
            format={{
              maximumFractionDigits: 2,
            }}
          />
        </Flex>
      </Events>
      <Events class={style.Balances__item} pressTransform onClick={core.route.modal.bonusStars}>
        <Flex direction={"row"} gap={"6px"}>
          <IconBonusStar width={14} height={14} />
          <AnimationNumber
            value={core.api.balance.getTransform(core.state.balance.bonus_stars)}
            format={{
              maximumFractionDigits: 2,
            }}
          />
        </Flex>
      </Events>
      <Events class={style.Balances__item} pressTransform onClick={core.route.goProfile.default}>
        <Flex direction={"row"} gap={"6px"}>
          <IconStars width={14} height={14} />
          <AnimationNumber
            value={core.api.balance.getTransform(core.state.balance.stars)}
            format={{
              maximumFractionDigits: 2,
            }}
          />
        </Flex>
      </Events>
    </Flex>
  )
}

export default Balances
