import toArray from "@ui/utils/toArray"
import style from "./Action.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  children,
  Show,
  createEffect,
  useContext,
  createMemo,
} from "solid-js"
import ActionContext from "./ActionContext"
import LayoutManager from "@ui/Template/LayoutManager/LayoutManager"
import { createStore, produce } from "solid-js/store"
import RootContext from "../../RootContext"
import TabbarRootContext from "@ui/Tabbar/TabbarRoot.context"
interface Action extends JSX.HTMLAttributes<HTMLDivElement> {
  bar?: JSX.Element
}

type Store = {
  view: string
  bar_hidden: boolean
  barSettings: Record<
    string,
    {
      active: string
      panels: string[]
      hidden: boolean
      height: number
    }
  >
}

const Action: Component<Action> = (props) => {
  const tabbarRootContext = useContext(TabbarRootContext)
  const context = useContext(RootContext)

  const [store, setStore] = createStore<Store>({
    view: context?.getActive() || "",
    bar_hidden: true,
    barSettings: {},
  })

  const views = toArray(children(() => props.children))

  const navs = createMemo(() => views.map((x) => x.nav).join("-"))

  const getView = (nav: string) => {
    return views.find((x) => x.nav === nav)
  }

  createEffect(() => {
    setStore("view", context?.getActive() || "")
  })

  const setBarSettings = (activePanel: string, panels: string[]) => {
    setStore(
      produce((store) => {
        store.barSettings[store.view] = {
          active: activePanel,
          panels,
          hidden: panels.includes(activePanel),
          height: store.barSettings?.[store.view]?.height || 0,
        }

        if (!store.barSettings[store.view].hidden) {
          setStore("bar_hidden", store.barSettings[store.view].hidden)
        }

        return store
      }),
    )
  }

  const onAnimEnd = () => {
    setStore(
      produce((store) => {
        const view = store.barSettings[store.view]
        if (view) {
          view.hidden = view.panels.includes(view.active)
          store.bar_hidden = view.hidden
        }

        return store
      }),
    )
  }

  return {
    getNav: (nav: string) => !!getView(nav),
    nav: navs(),
    component: () => (
      <ActionContext.Provider
        value={{
          getIsBar: () => !!props.bar,
          bar: () => <Show when={!store.bar_hidden}>{props.bar}</Show>,
          setBarSettings,
          onAnimEnd,
          // setStatusBar: (status: boolean, active: string) => {
          //   setStore("bar_hidden", status)
          // },
        }}
      >
        <LayoutManager
          key={"Root_action"}
          class={style.Action}
          classList={{
            [`${props.class}`]: !!props.class,
            ...props.classList,
          }}
          active={store.view}
          elements={props.children}
          styles={{
            firstIndex: style[`Action--index-1`],
            lastIndex: style[`Action--index-2`],
            firstElement: style[`Action--first`],
            lastElement: style[`Action--last`],
            next: style[`Action--to-next`],
            back: style[`Action--to-back`],
          }}
        >
          <LayoutManager.Last class={style.Action__Container} />
          <LayoutManager.First class={style.Action__Container} />
          <Show when={store.bar_hidden}>
            <div class={style.Action__bar}>{props.bar}</div>
          </Show>
        </LayoutManager>
      </ActionContext.Provider>
    ),
  } as unknown as JSX.Element
}

export default Action
