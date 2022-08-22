export * as flags from 'https://deno.land/std@0.121.0/flags/mod.ts'
export * as path from 'https://deno.land/std@0.121.0/path/mod.ts'
export {
	FileType,
	PackType,
	ProjectConfig,
} from 'https://cdn.skypack.dev/mc-project-core?dts'
export { isMatch } from 'https://raw.githubusercontent.com/bridge-core/common-utils/main/src/glob/isMatch.ts'
// @deno-types="https://cdn.skypack.dev/-/dash-compiler@v0.9.26-rtDMyl7gGAKD0gZPrwEG/dist=es2019,mode=types/dist/main.d.ts"
export {
	Dash,
	FileSystem,
	initRuntimes,
} from 'https://raw.githubusercontent.com/bridge-core/dash-compiler/main/dist/dash-compiler.bundled.es.js'
export { default as json5 } from 'https://cdn.skypack.dev/json5'
export { debounce } from 'https://cdn.skypack.dev/lodash?dts'
import { default as dashPackageJson } from 'https://raw.githubusercontent.com/bridge-core/dash-compiler/main/package.json' assert { type: 'json' }

let swcVersion = dashPackageJson.dependencies['@swc/wasm-web']
if(swcVersion.startsWith('^')) swcVersion = swcVersion.slice(1)

export {swcVersion}
