/* UI */
import createStyle from "@ui/utils/createStyle"
/* UI */

import styleDefault from "../Container.module.css"
import iOS from "./iOS.module.css"
import android from "./android.module.css"
// import macOS from "./macOS.module.css"
// import windows from "./windows.module.css"
// import others from "./others.module.css"

export const styles = createStyle(styleDefault, {
  iOS,
  android,
  // macOS,
  // windows,
  // others,
})
