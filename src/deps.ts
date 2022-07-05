export * as flags from 'https://deno.land/std@0.121.0/flags/mod.ts'
export * as path from 'https://deno.land/std@0.121.0/path/mod.ts'
export {
	FileType,
	PackType,
	ProjectConfig,
} from 'https://cdn.skypack.dev/mc-project-core?dts'
export { isMatch } from 'https://raw.githubusercontent.com/bridge-core/common-utils/main/src/glob/isMatch.ts'
// @deno-types="https://cdn.skypack.dev/-/dash-compiler@v0.8.24-fJZPTI917RoYY3ZxAwRh/dist=es2019,mode=types/dist/main.d.ts"
export {
	Dash,
	FileSystem,
} from 'https://raw.githubusercontent.com/bridge-core/dash-compiler/main/dist/dash-compiler.bundled.es.js'
export { default as json5 } from 'https://cdn.skypack.dev/json5'
export { debounce } from 'https://cdn.skypack.dev/lodash?dts'
