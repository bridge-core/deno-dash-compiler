export * as path from "jsr:@std/path@1.1.6";
export {
  FileType,
  type IFileType,
  PackType,
  ProjectConfig,
} from "npm:@bridge-editor/mc-project-core@0.5.0";
export { isMatch } from "npm:@bridge-editor/common-utils@0.3.3";

export {
  Dash,
  FileSystem,
  initRuntimes,
} from "npm:@bridge-editor/dash-compiler@0.14.0-alpha.7/bundled";
// @ts-ignore - json5 has a default export at runtime via esm.sh
export { default as json5 } from "npm:json5@2.2.3";
export { debounce } from "jsr:@std/async@1.5.0";
import { default as dashPackageJson } from "npm:@bridge-editor/dash-compiler@0.14.0-alpha.7/package.json" with { type: "json" };

let swcVersion = dashPackageJson.dependencies["@swc/wasm-web"];
if (swcVersion.startsWith("^")) swcVersion = swcVersion.slice(1);

export { swcVersion };
