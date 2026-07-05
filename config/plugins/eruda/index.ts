import fs from "node:fs"
import path from "node:path";

import type {
    IndexHtmlTransformResult,
    Plugin
} from 'vite';

const eruda = (): Plugin => ({
    name: 'vite-plugin-eruda',
    transformIndexHtml(html: string): IndexHtmlTransformResult {
        return {
            html,
            tags: [
                {
                    tag: 'script',
                    children: fs.readFileSync(path.join(path.dirname(__filename), "eruda.js")).toString(),
                    injectTo: 'head',
                },
                {
                    tag: 'script',
                    children: 'eruda.init();',
                    injectTo: 'head',
                }
            ]
        }

    }
})

export default eruda;
