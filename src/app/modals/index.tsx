import { Modal } from "@ui/index"
import { useRoute } from "root/router"
import { type JSX, type Component } from "solid-js"

import SeasonRules from "./SeasonRules/SeasonRules"
import BonusStars from "./BonusStars/BonusStars"
import MarketGifts from "./MarketGifts/MarketGifts"
import Referral from "./Referral/Referral"
import Replenishment from "./Replenishment/Replenishment"
import MinesStart from "./MinesStart/MinesStart"

interface Modals extends JSX.HTMLAttributes<HTMLDivElement> {}

const Modals: Component<Modals> = (props) => {
  const modal = useRoute("modal")

  return (
    <Modal.Root activeModal={modal() || ""}>
      <Modal.Root.Path nav={"season_rules"} component={SeasonRules} />
      <Modal.Root.Path nav={"bonus_stars"} component={BonusStars} />
      <Modal.Root.Path nav={"market_gifts"} component={MarketGifts} />
      <Modal.Root.Path nav={"referral"} component={Referral} />
      <Modal.Root.Path nav={"replenishment"} component={Replenishment} />
      <Modal.Root.Path nav={"mines_start"} component={MinesStart} />
    </Modal.Root>
  )
}

export default Modals
