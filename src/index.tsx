import App from "src/app"
import { render } from "solid-js/web"
import { Router } from "root/router"

import "src/styles/system.css"
import "src/styles/default.css"

/**
 * Блокировка контекстного меню
 */
// document.addEventListener("contextmenu", (e) => e.preventDefault())
// document.addEventListener("touchstart", (e) => {
//   e.preventDefault()
//   e.stopPropagation()
// })

render(
  () => (
    <Router view={"startup"}>
      <App />
    </Router>
  ),
  document.body,
)

// render(
//   () => (
//     <div
//       style={{
//         position: "absolute",
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0,
//         display: "flex",
//         "flex-direction": "column",
//         padding: "50px",
//         "padding-top": "200px",
//       }}
//     >
//       {bridge.send("VKWebAppInit")}
//       <Button
//         onClick={() => {
//           console.log("AWGGWAGW")
//         }}
//       >
//         ALERT
//       </Button>

//       <Field>
//         <Field.Textarea />
//       </Field>
//     </div>
//   ),
//   document.body,
// )

// var height = window.innerHeight

// const pool = () => {
//   if (height !== window.innerHeight) {
//     document.documentElement.style.setProperty(
//       "--app-height",
//       `${window.innerHeight}px`,
//     )
//   }
//   height = window.innerHeight
//   requestAnimationFrame(() => {
//     setTimeout(() => {
//       pool()
//     }, 100)
//   })
// }
// pool()

// document.addEventListener(
//   "scroll",
//   (e) => {
//     document.documentElement.scrollTop = document.body.clientHeight
//     document.body.scrollTop = document.body.clientHeight
//   },
//   { passive: true },
// )
// document.addEventListener(
//   "touchmove",
//   (e) => {
//     document.documentElement.scrollTop = document.body.clientHeight
//     document.body.scrollTop = document.body.clientHeight
//   },
//   { passive: true },
// )
// document.addEventListener(
//   "touchend",
//   (e) => {
//     document.documentElement.scrollTop = document.body.clientHeight
//     document.body.scrollTop = document.body.clientHeight
//   },
//   { passive: true },
// )

// // Проверка поддержки QUIC API
// function checkQUICSupport() {
//   console.log("Проверка поддержки QUIC в браузере:")

//   // Проверка Experimental QUIC API
//   if ("quic" in navigator && navigator.quic) {
//     console.log("✅ Experimental QUIC API доступен")
//     console.log("navigator.quic:", navigator.quic)
//   } else {
//     console.log("❌ Experimental QUIC API недоступен")
//   }

//   // Проверка WebTransport (современная замена QUIC)
//   if ("WebTransport" in window) {
//     console.log("✅ WebTransport API доступен")
//     console.log("WebTransport поддерживается")
//   } else {
//     console.log("❌ WebTransport API недоступен")
//   }
// }

// checkQUICSupport()
