import { useContext } from "solid-js"
import MediaContext from "../Media.context"

const useMedia = () => {
  const context = useContext(MediaContext)

  return context
}

export default useMedia
