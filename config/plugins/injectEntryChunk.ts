import { OutputAsset } from "rollup"
import type { Plugin } from "vite"

import postcss from "postcss"
import autoprefixer from "autoprefixer"

type Bundle = Record<
  string,
  {
    name: string | undefined
    source: string | Uint8Array
    type: "asset"
    code: string
    viteMetadata: {
      importedCss: Set<string>
      importedAssets: Set<string>
    }
    isEntry: boolean
  }
>

const injectEntryChunk = (): Plugin => ({
  name: "vite-plugin-inject-entry-chunk",
  enforce: "post",
  apply: "build",

  generateBundle: (_, bundle) =>
    new Promise((resolve) => {
      const htmlChunk = (bundle as unknown as Bundle)["index.html"]
      if (!htmlChunk) {
        return
      }

      const deletedCSS = new Set<string>()

      const keys = Object.keys(bundle)
      for (const name of keys) {
        const metadata = (bundle as unknown as Bundle)[name].viteMetadata

        if (!metadata) {
          continue
        }
        const importCSS = metadata.importedCss
        if (!importCSS) {
          continue
        }

        ;(importCSS as Set<string>).forEach(async (nameCSS) => {
          const source = (bundle[nameCSS] as unknown as OutputAsset).source

          deletedCSS.add(nameCSS)

          postcss([autoprefixer({ overrideBrowserslist: ["> 0%"] })])
            .process(source)
            .then(({ css }) => {
              ;(bundle[name] as any).code =
                `(() => {var e = document.createElement('style');e.innerText = ${JSON.stringify(css)};document.head.appendChild(e)})();${(bundle[name] as any).code}`
            })
        })

        ;(bundle[name] as any).viteMetadata.importedCss = new Set()
      }

      deletedCSS.forEach((name) => {
        const regexp = new RegExp(`<link[^>]+${name}[^>]>`)
        htmlChunk.source = `${htmlChunk.source}`.replace(regexp, "")
        delete bundle[name]
      })

      resolve()
    }),
})

export default injectEntryChunk
