import { onCleanup, onMount } from "solid-js"
import { _emitter } from "../emitter"

const useFreeze = (callback: () => void) => {
  onMount(() => {
    const cleanup = _emitter.on("freeze", callback)

    onCleanup(cleanup)
  })
}

export default useFreeze
