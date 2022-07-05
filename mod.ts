import { CLI } from './src/CLI.ts'

// @ts-ignore: Required by some of our dependencies
window.global = window
// @ts-ignore: Required by some of our dependencies
window.process = {
	cwd: () => '',
	env: {},
}

if (import.meta.main) {
	const cli = new CLI(Deno.args)
	await cli.run()
}
