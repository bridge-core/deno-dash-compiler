export * as path from 'jsr:@std/path';
export {
	FileType,
	type IFileType,
	PackType,
	ProjectConfig,
} from 'https://esm.sh/@bridge-editor/mc-project-core@0.5.0-alpha.2';
export { isMatch } from 'npm:@bridge-editor/common-utils';
// @deno-types="https://esm.sh/@bridge-editor/dash-compiler@0.12.0"
export {
	Dash,
	FileSystem,
	initRuntimes,
} from 'https://unpkg.com/@bridge-editor/dash-compiler@0.12.0/dist/dash-compiler.bundled.es.js';
export { default as json5 } from 'https://esm.sh/json5@2.2.3';
export { debounce } from 'jsr:@std/async';
import { default as dashPackageJson } from 'https://unpkg.com/@bridge-editor/dash-compiler@0.12.0/package.json' with { type: 'json' };

let swcVersion = dashPackageJson.dependencies['@swc/wasm-web'];
if (swcVersion.startsWith('^')) swcVersion = swcVersion.slice(1);

export { swcVersion };
