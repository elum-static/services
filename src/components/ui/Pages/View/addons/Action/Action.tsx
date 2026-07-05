import style from "./Action.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  children,
  Show,
  createEffect,
  createSignal,
  useContext,
} from "solid-js"

import toArray from "@ui/utils/toArray"
import ActionContext from "@ui/Pages/Root/addons/Action/ActionContext"
import ViewContext from "../../ViewContext"
import ActionViewContext from "./ActionViewContext"
import TabbarRootContext from "@ui/Tabbar/TabbarRoot.context"

interface Action extends JSX.HTMLAttributes<HTMLDivElement> {}

const Action: Component<Action> = (props) => {
  const contextTabbarRoot = useContext(TabbarRootContext)
  const contextView = useContext(ViewContext)
  const context = useContext(ActionContext)
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  const [panelActive, setPanelActive] = createSignal(contextView?.getActive() || "")

  const views = toArray(children(() => local.children))

  const navs = views.map((x) => x.nav)

  const getView = (nav: string) => {
    return views.find((x) => x.nav === nav)
  }

  createEffect(() => {
    const activePanel = contextView?.getActive() || ""
    context?.setBarSettings?.(activePanel, navs)

    if (views.find((x) => x.nav === activePanel)) {
      setPanelActive(activePanel)
    }
  })

  return {
    getNav: (nav: string) => !!getView(nav),
    nav: navs.join("-"),
    component: () => (
      <div
        class={style.Action}
        classList={{
          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        {...others}
      >
        <div class={style.Action__in}>
          <ActionViewContext.Provider
            value={{
              getTabbarHeight: () => contextTabbarRoot?.getTabbarHeight() || 0,
              getTabbarWidth: () => contextTabbarRoot?.getTabbarWidth() || 0,
            }}
          >
            <Show keyed when={getView(panelActive())}>
              {(panel) => panel.component({ nav: panel.nav })}
            </Show>
          </ActionViewContext.Provider>
        </div>
        <div class={style.Action__bar}>{context?.bar?.()}</div>
      </div>
    ),
  } as unknown as JSX.Element
}

export default Action
