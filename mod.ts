// deno-lint-ignore-file no-explicit-any
import { CLI } from './src/CLI.ts'
import yargs from "https://deno.land/x/yargs@v17.5.1-deno/deno.ts"
import { comMojangFolder } from './src/comMojangFolder.ts'

// @ts-ignore: Required by some of our dependencies
window.global = window
// @ts-ignore: Required by some of our dependencies
window.process = {
	cwd: () => '',
	env: {},
}

type YargsInstance = ReturnType<typeof yargs>

if (import.meta.main) {
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
				return yargs
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
						description: 'Quick reload for functions and scripts',
						type: 'number',
					})
					// Need to use coerce rather than "default" so we can differentiate between when the option isn't used or is used without an argument
					.coerce('reload', (arg: any) => {
						if (!arg) return 8080
						else return arg
					})
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
