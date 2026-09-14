// deno-lint-ignore-file no-explicit-any
import { CLI } from "./src/CLI.ts";
import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { compare as semverCompare, parse as semverParse } from "jsr:@std/semver@1.0.8";
import { comMojangFolder } from "./src/comMojangFolder.ts";
import { fs, initRuntimes, path, swcVersion } from "./src/deps.ts";
import { getLocalDataPath, saveLocalData, tryInvalidateLocalData } from "./src/LocalCache.ts";

type YargsInstance = ReturnType<typeof yargs>;
const CURRENT_VERSION = `1.1.1`;

async function fetchLatestVersion(): Promise<string | null> {
	try {
		const response = await fetch("https://api.github.com/repos/bridge-core/deno-dash-compiler/releases/latest");
		if (!response.ok) {
			return null;
		}
		const data = await response.json();
		return data.tag_name;
	} catch (error) {
		console.error("Error fetching the latest version:", error);
		return null;
	}
}

function compareVersions(current: string, latest: string): number {
	const currentVersion = semverParse(current);
	const latestVersion = semverParse(latest);
	if (!currentVersion || !latestVersion) {
		throw new Error("Invalid version format");
	}
	return semverCompare(currentVersion, latestVersion);
}

async function checkForUpdates() {
	const latestVersion = await fetchLatestVersion();
	if (latestVersion && compareVersions(CURRENT_VERSION, latestVersion) < 0) {
		console.log(
			`%cA new version (${latestVersion}) is available. You are currently using version v${CURRENT_VERSION}.`,
			"color: red; font-weight:bold;",
		);
	} else if (latestVersion && compareVersions(CURRENT_VERSION, latestVersion) > 0) {
		console.log(
			`%cYou are using a dev version ${CURRENT_VERSION} compared to the latest version (${latestVersion}).`,
			"color: green; font-weight:bold;",
		);
	}
}

await tryInvalidateLocalData();

async function getWasmRuntime(): Promise<string> {
	try {
		const cachedDataPath = await getLocalDataPath();

		if (!cachedDataPath) return `https://esm.sh/@swc/wasm-web@${swcVersion}/wasm-web_bg.wasm`;

		const wasmRuntimePath = path.join(cachedDataPath, "wasm-web_bg.wasm");

		if (!(await fs.exists(wasmRuntimePath))) {
			const buffer = await (await fetch(`https://esm.sh/@swc/wasm-web@${swcVersion}/wasm-web_bg.wasm`))
				.arrayBuffer();

			console.log("Caching wasm runtime!");

			await saveLocalData("wasm-web_bg.wasm", buffer);
		}

		console.log("Using cached wasm runtime...");

		return path.toFileUrl(wasmRuntimePath).href;
	} catch {
		// empty
	}

	console.log("Failed to cache wasm runtime. Using network wasm runtime...");

	return `https://esm.sh/@swc/wasm-web@${swcVersion}/wasm-web_bg.wasm`;
}

initRuntimes(await getWasmRuntime());

if (import.meta.main) {
	await checkForUpdates();
	const cli = new CLI();

	yargs(Deno.args)
		.scriptName("dash_compiler")
		.command(
			"build",
			"Build the current project",
			(yargs: YargsInstance) => {
				return yargs
					.option("out", {
						alias: "o",
						description: "The output directory",
						type: "string",
					})
					.option("mode", {
						alias: "m",
						description: "The mode to build for",
						type: "string",
						default: "production",
						choices: ["development", "production"],
					})
					.option("compilerConfig", {
						alias: "c",
						description: "The compiler config file",
						type: "string",
					});
			},
			async (argv: any) => {
				await cli.build(argv);
			},
		)
		.command(
			"watch",
			"Build the current project and watch for future changes",
			(yargs: YargsInstance) => {
				return (
					yargs
						.option("out", {
							alias: "o",
							description: "The output directory",
							type: "string",
							default: comMojangFolder,
						})
						.option("mode", {
							alias: "m",
							description: "The mode to build for",
							type: "string",
							default: "development",
							choices: ["development", "production"],
						})
						.option("compilerConfig", {
							alias: "c",
							description: "The compiler config file",
							type: "string",
						})
						.option("reload", {
							alias: "r",
							description: "Quick reload for functions and scripts",
							type: "number",
						})
						// Need to use coerce rather than "default" so we can differentiate between when the option isn't used or is used without an argument
						.coerce("reload", (arg: any) => {
							if (!arg) return 8080;
							else return arg;
						})
				);
			},
			async (argv: any) => {
				await cli.watch(argv);
			},
		)
		.strictCommands(true)
		.demandCommand(1)
		.help()
		.parse();
}
