import { Avatar, Cell, Flex, Image, Text } from "src/components/ui"
import style from "./SeasonItem.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { IconLighting } from "src/source"

interface SeasonItem extends JSX.HTMLAttributes<HTMLDivElement> {
  avatar?: string
  first_name?: string
  position: number
  reward: URL
}

const SeasonItem: Component<SeasonItem> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "avatar",
    "first_name",
    "position",
    "reward",
  ])

  return (
    <Flex
      class={style.SeasonItem}
      classList={{
        [style[`SeasonItem__position--accent`]]: local.position <= 3,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      direction={"row"}
      gap={"10px"}
    >
      <span class={style.SeasonItem__after}>
        <Cell
          class={style.SeasonItem__cell}
          background={"transparent"}
          before={
            <Avatar src={local.avatar || ""} name={local.first_name?.[0] || ""} size={"40px"} />
          }
          separator={false}
          subTitle={
            <Text overflow nowrap class={style.SeasonItem__lightning} size={"small"}>
              <Text.Badge>
                <IconLighting width={16} height={16} />
              </Text.Badge>
              <Text.Content>{125}</Text.Content>
            </Text>
          }
        >
          <Text overflow nowrap>
            <Text.Content>{local.first_name}</Text.Content>
          </Text>
        </Cell>
        <span class={style.SeasonItem__position}>#{local.position}</span>
      </span>
      <span class={style.SeasonItem__before}>
        <span class={style.SeasonItem__reward__animation} />
        <Image
          backgroundColor={"transparent"}
          src={local.reward}
          style={{
            width: "56px",
            height: "56px",
          }}
        />
      </span>
    </Flex>
  )
}

export default SeasonItem
