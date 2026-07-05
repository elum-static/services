import type { Plugin } from "vite"
import { OutputAsset, OutputChunk } from "rollup"
import classGenerator from "./classGenerator.js"

export default function variablesOptimization(): Plugin {
  const varMap = new Map<string, string>()
  const nextVarName = classGenerator()

  const replaceInCode = (code: string) => {
    return code.replace(/(?<![a-zA-Z0-9_-])(--[a-zA-Z0-9_-]{6,})(?![a-zA-Z0-9_-])/g, (full) => {
      if (!varMap.has(full)) {
        varMap.set(full, "--" + nextVarName())
      }
      return varMap.get(full) || full
    })
  }

  return {
    name: "vite-plugin-variables-optimization",
    enforce: "post",
    apply: "build",

    generateBundle(_, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset") {
          if (typeof chunk.source === "string") {
            chunk.source = replaceInCode(chunk.source)
          }
        } else if (chunk.type === "chunk") {
          chunk.code = replaceInCode(chunk.code)
        }
      }
    },
  }
}
