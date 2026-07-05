import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import type { OutputOptions } from "rollup" // ← добавьте 'type'

import { compilerOptions } from "./tsconfig.json"
import classGenerator from "./plugins/classGenerator"
import solidSVG from "./plugins/solidSVG"
import spritesPlugin from "vite-plugin-svg-sprite-components-solid"
import tsconfigPaths from "vite-tsconfig-paths"
import solidPlugin from "vite-plugin-solid"
import injectEntryChunk from "./plugins/injectEntryChunk"
import cssnano from "cssnano"
import { execSync } from "child_process"
import variablesOptimization from "./plugins/variablesOptimization"

import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

const gitCommitHash = execSync("git rev-parse --short HEAD").toString().trim()
const generator = classGenerator()

const output: OutputOptions = {
  // ← убрали массив, оставили один объект
  manualChunks: (id) => {
    if (id.includes("node_modules")) {
      if (id.includes("@tonconnect")) {
        return "tonconnect"
      }
      if (id.includes("hls.js")) {
        return "hls"
      }
      return "vendor"
    }
  },
  hoistTransitiveImports: false,
  chunkFileNames: "js/[name].[hash].js",
  entryFileNames: "js/[name].[hash].js",
  assetFileNames: "assets/[name].[hash][extname]",
  hashCharacters: "hex",
  compact: true,
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const isDev = env.VITE_OUT_DIR === "dev"

  return {
    base: env.VITE_BASE_DIR || "/",
    define: {
      "import.meta.env.APP_VERSION": JSON.stringify(gitCommitHash),
      "import.meta.env.VITE_BASE_DIR": JSON.stringify(env.VITE_BASE_DIR || "/"),
      "import.meta.env.DEV": JSON.stringify(isDev),
    },
    // ⚠️ Удалите секцию worker, если она не критична
    // Или оставьте только минимальную конфигурацию:
    worker: {
      format: "es", // Минимальная настройка
    },
    publicDir: "public",
    // esbuild: {
    //   pure: ["console.log", "console.error", "console.warn"],
    // },
    build: {
      target: "esnext",
      outDir: env.VITE_OUT_DIR || path.join(compilerOptions.outDir),
      minify: "terser",
      terserOptions: {
        toplevel: true,
        compress: {
          passes: 10,
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.error", "console.warn"],
          dead_code: true,
          unused: true,
          unsafe: true,
          unsafe_math: true,
          unsafe_symbols: true,
        },
        format: {
          comments: false,
          beautify: false,
        },
        mangle: {
          toplevel: true,
          keep_classnames: false,
        },
      },
      sourcemap: false,
      rollupOptions: {
        output: output,
      },
    },
    css: {
      modules: {
        generateScopedName: (name) => {
          if (name.startsWith("_")) {
            return name
          }
          return generator()
        },
        exportGlobals: false,
        getJSON: () => {},
      },
      postcss: {
        plugins: [
          cssnano({
            preset: [
              "default",
              {
                colormin: false,
              },
            ],
          }),
        ],
      },
    },
    server: {
      port: 18300,
      host: "0.0.0.0",
      allowedHosts: true,
    },
    plugins: [
      tsconfigPaths(),
      variablesOptimization(),
      solidPlugin({
        dev: false,
        hot: false,
        solid: {
          omitNestedClosingTags: true,
          generate: "dom",
          delegateEvents: true,
          wrapConditionals: true,
        },
      }),
      injectEntryChunk(),
      solidSVG({
        svgo: {
          enabled: false,
        },
      }),
      spritesPlugin(),
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|svg|webp)$/i, // Какие форматы обрабатывать
        include: undefined,
        exclude: undefined,
        cache: false,
        // svg: {
        //   multipass: true,
        //   plugins: [{ name: 'removeViewBox' }],
        // },
        png: {
          quality: 80, // Сжатие PNG
        },
        jpeg: {
          quality: 80, // Сжатие JPEG
        },
        jpg: {
          quality: 80, // Сжатие JPG
        },
        webp: {
          lossless: false, // Включение конвертации в WebP
          quality: 80,
        },
      }),
    ],
  }
})
