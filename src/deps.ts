export * as flags from 'https://deno.land/std@0.121.0/flags/mod.ts'
export * as path from 'https://deno.land/std@0.121.0/path/mod.ts'
export {
	FileType,
	PackType,
	ProjectConfig,
	type IFileType,
} from 'https://esm.sh/mc-project-core@0.3.21'
export { isMatch } from 'https://esm.sh/bridge-common-utils@0.3.3'
// @deno-types="https://esm.sh/dash-compiler@0.10.4"
export {
	Dash,
	FileSystem,
	initRuntimes,
} from 'https://raw.githubusercontent.com/bridge-core/dash-compiler/main/dist/dash-compiler.bundled.es.js'
export { default as json5 } from 'https://esm.sh/json5@2.2.1'
export { debounce } from 'https://deno.land/std@0.156.0/async/mod.ts?s=debounce'
import { default as dashPackageJson } from 'https://raw.githubusercontent.com/bridge-core/dash-compiler/main/package.json' with { type: 'json' }

let swcVersion = dashPackageJson.dependencies['@swc/wasm-web']
if (swcVersion.startsWith('^')) swcVersion = swcVersion.slice(1)

export { swcVersion }
