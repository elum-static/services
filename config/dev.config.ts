import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import solidPlugin from "vite-plugin-solid"

import classGenerator from "./plugins/classGenerator"
import eruda from "./plugins/eruda"
import solidSVG from "./plugins/solidSVG"

import { execSync } from "child_process" // Import execSync
import variablesOptimization from "./plugins/variablesOptimization"
const gitCommitHash = execSync("git rev-parse --short HEAD").toString().trim()

const generator = classGenerator()

export default defineConfig({
  base: "./",
  define: {
    "import.meta.env.TELEGRAM_SIGN": JSON.stringify(
      "user%3D%257B%2522id%2522%253A463112366%252C%2522first_name%2522%253A%2522%25F0%259D%2595%2580%25F0%259D%2595%259A%25F0%259D%2595%25A4%25F0%259D%2595%25A6%25F0%259D%2595%25A4%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522xuserz%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252FihqEg9uWlYgJbiAv6H3pklOpERYOFJ94MmO_U4Jy36c.svg%2522%257D%26chat_instance%3D2891777704548156672%26chat_type%3Dprivate%26auth_date%3D1763509287%26signature%3DiY9Rxh5J0DeX7sXW6jSzgqWm8QWgVckC30ifeEACmCzHXer0ax1n76LwNFLplt0WoXjmF8sGhrJpTgCoQNxaAQ%26hash%3D87c2e11bc7d44a814497f6cf5bb318de53ef4de68a74d2ed6e886acc4ed31e42",
    ),
    "import.meta.env.APP_VERSION": JSON.stringify(gitCommitHash + ".dev"),
    "import.meta.env.VITE_BASE_DIR": JSON.stringify("/"),
  },
  css: {
    modules: {
      generateScopedName: (name) => {
        if (name.startsWith("_")) {
          return name
        }
        return `${name}_${generator()}`
      },
    },
  },
  // build: {
  //   sourcemap: false, // отключает sourcemap в production-сборке
  // },
  // esbuild: {
  //   sourcemap: false, // отключает sourcemap в dev-режиме
  // },
  server: {
    port: 18410,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  plugins: [
    eruda(),
    tsconfigPaths(),
    solidPlugin({
      dev: true,
    }),
    solidSVG({
      svgo: {
        enabled: false,
      },
    }),
    {
      name: "tonconnect-dev-manifest",
      configureServer(server) {
        server.middlewares.use("/tonconnect-manifest.json", (req, res) => {
          const host = req.headers.host || "localhost:18410"
          const origin = `http://${host}`

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(
            JSON.stringify({
              url: origin,
              name: "Elum Monkey",
              iconUrl: `${origin}/icon-512x512.png`,
            }),
          )
        })
      },
    },
  ],
})
// `

// /index.html#tgWebAppData=user%3D%257B%2522id%2522%253A463112366%252C%2522first_name%2522%253A%2522%25F0%259D%2595%2580%25F0%259D%2595%259A%25F0%259D%2595%25A4%25F0%259D%2595%25A6%25F0%259D%2595%25A4%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522xuserz%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252FihqEg9uWlYgJbiAv6H3pklOpERYOFJ94MmO_U4Jy36c.svg%2522%257D%26chat_instance%3D2891777704548156672%26chat_type%3Dprivate%26auth_date%3D1763507876%26signature%3DE14brzsd7MZIQuPafxiP_EhW04iV5kwrUGfX15_ueo0v8YhBKt5_YAJwguqDnpC-9ntz88TYZgeoyR8JsI72AQ%26hash%3Dc8b6aa98e60e322ba9500cfc429d64eca1cde417fce63978f99f3d461ccd81b3&tgWebAppVersion=9.1&tgWebAppPlatform=weba&tgWebAppThemeParams=%7B"bg_color"%3A"%23212121"%2C"text_color"%3A"%23ffffff"%2C"hint_color"%3A"%23aaaaaa"%2C"link_color"%3A"%238774e1"%2C"button_color"%3A"%238774e1"%2C"button_text_color"%3A"%23ffffff"%2C"secondary_bg_color"%3A"%230f0f0f"%2C"header_bg_color"%3A"%23212121"%2C"accent_text_color"%3A"%238774e1"%2C"section_bg_color"%3A"%23212121"%2C"section_header_text_color"%3A"%23aaaaaa"%2C"subtitle_text_color"%3A"%23aaaaaa"%2C"destructive_text_color"%3A"%23e53935"%7D
// `
