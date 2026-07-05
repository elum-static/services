import type { VisibilityState } from "./types/Visibility"
import type { AnimationState } from "./types/Animation"

import Emitter from "src/core/utils/emitter"
import Visibility from "./src/Visibility"
import Animation from "./src/Animation"

type EventsEmitter = {
  visibility: [state: VisibilityState]
  animation: [state: AnimationState]
}

class System extends Emitter<EventsEmitter> {
  public visibility = new Visibility(this.safeEmitter("visibility"))
  public animation = new Animation(this.safeEmitter("animation"))
}

export default System
