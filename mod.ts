// deno-lint-ignore-file no-explicit-any
import { CLI } from './src/CLI.ts'
import yargs from 'https://deno.land/x/yargs@v17.5.1-deno/deno.ts'
import { parse as semverParse, compare as semverCompare } from "jsr:@std/semver";
import { comMojangFolder } from './src/comMojangFolder.ts'
import { initRuntimes, swcVersion } from './src/deps.ts'

// @ts-ignore: Required by some of our dependencies
window.global = window
// @ts-ignore: Required by some of our dependencies
window.process = {
	cwd: () => '',
	env: {},
}

type YargsInstance = ReturnType<typeof yargs>
const CURRENT_VERSION = `0.4.7`

async function fetchLatestVersion(): Promise<string | null> {
    try {
        const response = await fetch('https://api.github.com/repos/bridge-core/deno-dash-compiler/releases/latest');
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.tag_name;
    } catch (error) {
        console.error('Error fetching the latest version:', error);
        return null;
    }
}

function compareVersions(current: string, latest: string): boolean {
	const currentVersion = semverParse(current);
	const latestVersion = semverParse(latest);
	if (!currentVersion || !latestVersion) {
		throw new Error('Invalid version format');
	}
	return semverCompare(currentVersion, latestVersion) < 0;
}

async function checkForUpdates() {
    const latestVersion = await fetchLatestVersion();
    if (latestVersion && compareVersions(CURRENT_VERSION, latestVersion)) {
        console.log(`%cA new version (${latestVersion}) is available. You are currently using version v${CURRENT_VERSION}.`, 'color: red; font-weight:bold;');
    }
}

initRuntimes(`https://esm.sh/@swc/wasm-web@${swcVersion}/wasm-web_bg.wasm`)

if (import.meta.main) {
	await checkForUpdates();
	const cli = new CLI()

	yargs(Deno.args)
		.command(
			'build',
			'Build the current project',
			(yargs: YargsInstance) => {
				return yargs
					.option('out', {
						alias: 'o',
						description: 'The output directory',
						type: 'string',
					})
					.option('mode', {
						alias: 'm',
						description: 'The mode to build for',
						type: 'string',
						default: 'production',
						choices: ['development', 'production'],
					})
					.option('compilerConfig', {
						alias: 'c',
						description: 'The compiler config file',
						type: 'string',
					})
			},
			async (argv: any) => {
				await cli.build(argv)
			}
		)
		.command(
			'watch',
			'Build the current project and watch for future changes',
			(yargs: YargsInstance) => {
				return (
					yargs
						.option('out', {
							alias: 'o',
							description: 'The output directory',
							type: 'string',
							default: comMojangFolder,
						})
						.option('mode', {
							alias: 'm',
							description: 'The mode to build for',
							type: 'string',
							default: 'development',
							choices: ['development', 'production'],
						})
						.option('compilerConfig', {
							alias: 'c',
							description: 'The compiler config file',
							type: 'string',
						})
						.option('reload', {
							alias: 'r',
							description:
								'Quick reload for functions and scripts',
							type: 'number',
						})
						// Need to use coerce rather than "default" so we can differentiate between when the option isn't used or is used without an argument
						.coerce('reload', (arg: any) => {
							if (!arg) return 8080
							else return arg
						})
				)
			},
			async (argv: any) => {
				await cli.watch(argv)
			}
		)
		.strictCommands(true)
		.demandCommand(1)
		.help()
		.parse()
}
