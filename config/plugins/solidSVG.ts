import { readFile } from "node:fs/promises";
import { optimize, loadConfig } from "svgo";
import { Config } from 'svgo';
import { Plugin } from 'vite';

type CompilerOptions = {
    allow_props_children?: boolean;
};

type SolidSVGPluginOptions = {
    defaultAsComponent?: boolean;
    svgo?: {
        enabled?: boolean;
        svgoConfig?: Config;
    };
    compilerOptions?: CompilerOptions;
};

async function compileSvg(source: any, compilerOptions: any) {
    let svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/<!--\s*([\s\S]*?)\s*-->/g, "{/* $1 */}").replace(/(<svg[^>]*)>/i, "$1{...props}>");
    if (compilerOptions.allow_props_children) {
        svgWithProps = svgWithProps.replace(/\{'\{'\}\s*(props\.children)\s*\{'\}'\}/g, "{$1}");
    }
    return `export default (props = {}) => ${svgWithProps}`;
}

async function optimizeSvg(content: any, path: any, svgoConfig: any) {
    const config = svgoConfig || await loadConfig();
    if (config && config.datauri) {
        throw new Error(
            "datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value."
        );
    }
    const result = optimize(content, Object.assign({}, config, { path }));
    return result.data;
}

export default function package_default(options: SolidSVGPluginOptions = {}): Plugin {
    const {
        defaultAsComponent = true,
        svgo = { enabled: true },
        compilerOptions = { allow_props_children: false }
    } = options;
    const extPrefix = "component-solid";
    const shouldProcess = (qs: any) => {
        const params = new URLSearchParams(qs);
        return defaultAsComponent && !Array.from(params.entries()).length || params.has(extPrefix);
    };
    let config: any;
    let solidPlugin: any;
    return {
        enforce: "pre",
        name: "solid-svg",
        configResolved(cfg: any) {
            config = cfg;
            solidPlugin = config.plugins.find((p: any) => p.name == "solid");
            if (!solidPlugin) {
                throw new Error("solid plugin not found");
            }
        },
        async load(id: any) {
            const [path, qs] = id.split("?");
            if (!path.endsWith(".svg")) {
                return null;
            }
            if (shouldProcess(qs)) {
                let code = await readFile(path, { encoding: "utf8" });
                if (svgo.enabled) {
                    let optimized = await optimizeSvg(code, path, svgo.svgoConfig);
                    code = optimized || code;
                }
                const result = await compileSvg(code, compilerOptions);
                return result;
            }
        },
        transform(source: any, id: any, transformOptions: any) {
            const [path, qs] = id.split("?");
            if (path.endsWith(".svg") && shouldProcess(qs)) {
                const transformFn = typeof solidPlugin.transform === "function" ? solidPlugin.transform : solidPlugin.transform.handler;
                return transformFn.bind(this)(source, `${path}.tsx`, transformOptions);
            }
        }
    };
}
