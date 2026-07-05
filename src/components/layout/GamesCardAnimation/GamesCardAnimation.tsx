import style from "./GamesCardAnimation.module.css"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  children,
  createEffect,
  For,
} from "solid-js"
import { type EventsProps } from "src/components/ui/Template/Events/Events"
import { Events, Flex } from "src/components/ui"
import { createStore, produce } from "solid-js/store"
import GamesCard from "../GamesCard/GamesCard"

interface GamesCardAnimation extends EventsProps<"section"> {
  each: Array<{
    onClick?: () => void
    backgroundUrlStub?: string
    backgroundUrl: string
    backgroundColor?: string
  }>
  aspectRation: string
}

type Store = {
  blockWidth: number
  visibleBlocks: number
  anim: boolean
}

const GamesCardAnimation: Component<GamesCardAnimation> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "each", "aspectRation"])

  var ref: HTMLSpanElement
  var refChild: HTMLSpanElement

  const [store, setStore] = createStore<Store>({
    blockWidth: 0,
    visibleBlocks: 1,
    anim: true,
  })

  createEffect(() => {
    if (refChild! && ref!) {
      setStore(
        produce((store) => {
          store.blockWidth = refChild.clientWidth
          store.visibleBlocks = Math.ceil(ref.clientWidth / store.blockWidth)

          return store
        }),
      )
    }
  })

  return (
    <Events
      ref={ref! as unknown as EventsProps<"section">}
      class={style.GamesCardAnimation}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      tappable={false}
      {...others}
    >
      <Flex
        class={style.GamesCardAnimation__group}
        gap={"10px"}
        justify={"start"}
        direction={"row"}
        style={{
          transform: store.anim
            ? `translateX(-${store.blockWidth * (local.each.length + 1) + 10 * (local.each.length + 1) - 3}px)`
            : `translateX(-${store.blockWidth + 10}px)`,
          transition: store.anim ? `${2 * (local.each.length - 1) * 2}s linear` : "",
        }}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) {
            return
          }
          requestAnimationFrame(() => {
            setStore("anim", false)
            requestAnimationFrame(() => setStore("anim", true))
          })
        }}
      >
        <GamesCard
          ref={refChild!}
          backgroundUrlStub={local.each?.[local.each.length - 1].backgroundUrlStub}
          backgroundUrl={local.each?.[local.each.length - 1].backgroundUrl}
          backgroundColor={local.each?.[local.each.length - 1].backgroundColor}
          onClick={local.each?.[local.each.length - 1].onClick}
          aspectRatio={local.aspectRation}
        />
        <For
          each={Array.from({ length: local.each.length * 2 }).map(
            (_, index) => local.each?.[index % local.each.length],
          )}
        >
          {(item) => (
            <GamesCard
              onClick={item.onClick}
              backgroundUrlStub={item.backgroundUrlStub}
              backgroundUrl={item.backgroundUrl}
              backgroundColor={item.backgroundColor}
              aspectRatio={local.aspectRation}
            />
          )}
        </For>
      </Flex>
    </Events>
  )
}

export default GamesCardAnimation
