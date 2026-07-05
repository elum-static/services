import style from "./Gallery.module.css"

import { type Property } from "csstype"
import Image from "@ui/Template/Image/Image"

import {
  createEffect,
  For,
  mergeProps,
  on,
  onMount,
  Show,
  splitProps,
  type Component,
  type JSX,
} from "solid-js"

import combineStyle from "@ui/utils/combineStyle"
import { createStore, produce } from "solid-js/store"
import { Portal } from "solid-js/web"
import Flex from "@ui/Template/Flex/Flex"

import Cell from "@ui/Blocks/Cell/Cell"
import Spinner from "@ui/Blocks/Spinner/Spinner"
import { IconCircleXFilled } from "src/source"
import Button from "../Button/Button"

import Events, { type GestureEvent, isTouchSupport } from "@ui/Template/Events/Events"

interface Gallery<
  Image = { index: number; src: string; isLoading?: boolean },
> extends JSX.HTMLAttributes<HTMLSpanElement> {
  images: Image[]
  "border-radius"?: Property.BorderRadius
  only?: boolean
  onStatus: (open: () => boolean, handlerClose: () => void) => void
}

type Store = {
  isOpen?: boolean
  selectedIndex?: number
  slide?: "left" | "right"
  transformX: number
  transformY: number
  isAnim: boolean
}

const Gallery: Component<Gallery> = (props) => {
  const merged = mergeProps({ "border-radius": "12px" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "images",
    "style",
    "border-radius",
    "only",
    "onStatus",
  ])

  const [store, setStore] = createStore<Store>({
    isOpen: false,
    isAnim: false,
    transformX: 0,
    transformY: 0,
  })

  createEffect(
    on(
      () => store.isOpen,
      (isOpen) => {
        local.onStatus(
          () => !!isOpen,
          () => setStore("isOpen", false),
        )
      },
    ),
  )

  const handlerOpen = (image_index: number) => {
    const index = local.images.findIndex((x) => x.index === image_index)
    if (index === -1) {
      handlerClose()
      return
    }

    setStore(
      produce((store) => {
        store.selectedIndex = index
        store.isOpen = true
        store.isAnim = true
        return store
      }),
    )
  }

  const handlerClose = () => {
    setStore("isOpen", false)
  }

  return (
    <span
      class={style.Gallery}
      classList={{
        [style[`Gallery__count--${local.images.length}`]]: true,
        [style[`Gallery--only`]]: local.only,
      }}
      style={combineStyle(
        {
          "--border_radius": local["border-radius"],
        },
        local.style,
      )}
      {...others}
    >
      <For each={local.images}>
        {(image) => (
          <Image
            onClick={() => handlerOpen(image.index)}
            class={style.Gallery__image}
            src={image.src}
            fallback={<Spinner color={"secondary"} />}
          >
            {/* <Show when={image.isLoading}>
              <Image.Overlay visibility={"always"}>
                <Spinner color={"secondary"} />
              </Image.Overlay>
            </Show> */}
          </Image>
        )}
      </For>

      <Show when={store.isOpen}>
        <Portal mount={document.getElementById("root") as Node | undefined}>
          <span
            class={style.Gallery__open}
            classList={{
              [style[`Gallery--anim`]]: store.isAnim,
            }}
          >
            <Events
              onMoveY={(event) => {
                setStore("isAnim", false)
                const shiftX = event.shiftY || 0
                setStore("transformY", shiftX)
              }}
              onEndY={() => {
                if (store.transformY >= 60) {
                  setStore("isOpen", false)
                }
                setStore("isAnim", true)
                setStore("transformY", 0)
              }}
              onStartX={() => {
                setStore("isAnim", false)
              }}
              onMoveX={(event) => {
                const shiftX = event.shiftX || 0
                const selectedIndex = store.selectedIndex || 0

                if (shiftX <= -60 && !!local.images[selectedIndex + 1]) {
                  setStore("slide", "right")
                } else if (shiftX >= 60 && !!local.images[selectedIndex - 1]) {
                  setStore("slide", "left")
                } else {
                  setStore("slide", undefined)
                }
                if (shiftX <= 0 && !!local.images[selectedIndex + 1]) {
                  setStore("transformX", shiftX)
                } else if (shiftX >= 0 && !!local.images[selectedIndex - 1]) {
                  setStore("transformX", shiftX)
                }
              }}
              onEndX={(event) => {
                setStore("isAnim", true)
                if (store.slide === "left") {
                  setStore(
                    produce((store) => {
                      store.selectedIndex = (store.selectedIndex || 0) - 1
                      return store
                    }),
                  )
                } else if (store.slide === "right") {
                  setStore(
                    produce((store) => {
                      store.selectedIndex = (store.selectedIndex || 0) + 1
                      return store
                    }),
                  )
                }

                setStore("slide", undefined)

                setStore("transformX", 0)
              }}
              class={style.Gallery__touch}
            >
              <Flex
                class={style.Gallery__open_in}
                align={"center"}
                direction={"row"}
                style={{
                  transform: `translate(calc(-${
                    100 * (store.selectedIndex || 0)
                  }% + ${store.transformX || 0}px), ${store.transformY}px)`,
                }}
              >
                <For each={local.images}>
                  {(image, index) => (
                    <Show when={image}>
                      <Image
                        backgroundColor={"transparent"}
                        style={{
                          transform: `translateX(${100 * index()}%)`,
                        }}
                        data-index={index()}
                        onClick={() => handlerOpen(image.index)}
                        src={image.src}
                        class={style.Gallery__image}
                      />
                    </Show>
                  )}
                </For>
              </Flex>
            </Events>

            <Cell
              class={style.Gallery__footer}
              size={"small"}
              before={
                <Button
                  type={"icon"}
                  size={"small"}
                  mode={"soft"}
                  appearance={"neutral"}
                  style={{
                    opacity: 0,
                  }}
                >
                  <Button.Content>
                    <IconCircleXFilled />
                  </Button.Content>
                </Button>
              }
              after={
                <Button
                  type={"icon"}
                  size={"small"}
                  mode={"ghost"}
                  appearance={"secondary"}
                  onClick={handlerClose}
                >
                  <Button.Content>
                    <IconCircleXFilled />
                  </Button.Content>
                </Button>
              }
              disabled={false}
            >
              {/* <Cell.Container>
                <Cell.Before style={{ opacity: 0 }}>
                  <IconClose />
                </Cell.Before>
                <Cell.Content> */}
              <Flex class={style.Gallery__preview} direction={"row"}>
                <For each={local.images}>
                  {(image) => (
                    <Image
                      onClick={() => handlerOpen(image.index)}
                      src={image.src}
                      class={style.Gallery__image}
                      classList={{
                        [style[`Gallery--select`]]: image.index === store.selectedIndex,
                      }}
                    />
                  )}
                </For>
              </Flex>
              {/* </Cell.Content>
                <Cell.After onClick={handlerClose}>
                  <IconClose color={"white"} />
                </Cell.After>
              </Cell.Container> */}
            </Cell>
          </span>
        </Portal>
      </Show>
    </span>
  )
}

export default Gallery
