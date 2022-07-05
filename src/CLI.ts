import { CLIWatcher } from './CLIWatcher.ts'
import { comMojangFolder } from './comMojangFolder.ts'
import { Dash, flags, isMatch, path } from './deps.ts'
import { DenoFileSystem } from './FileSystem.ts'
import { FileTypeImpl, PackTypeImpl } from './McProjectCore.ts'

export class CLI {
	protected fs: DenoFileSystem
	protected outFs?: DenoFileSystem
	protected dash: Dash

	protected args: ReturnType<typeof flags.parse>
	get dashCommand() {
		const command = this.args._[0]

		if (typeof command === 'string') return command
		return null
	}
	get out() {
		return this.args.out
	}
	get mode() {
		return this.args.mode
	}
	get compilerConfig() {
		return this.args.compilerConfig
	}

	constructor(args: string[]) {
		this.args = flags.parse(args)

		this.fs = new DenoFileSystem()
		this.outFs =
			this.out || comMojangFolder
				? new DenoFileSystem(this.out ?? comMojangFolder)
				: undefined

		console.log(path.join(Deno.cwd(), 'config.json'))
		this.dash = new Dash(this.fs, this.outFs, {
			config: path.join(Deno.cwd(), 'config.json'),
			compilerConfig: this.compilerConfig
				? path.join(Deno.cwd(), this.compilerConfig)
				: undefined,
			packType: new PackTypeImpl(undefined),
			fileType: new FileTypeImpl(undefined, isMatch),
			mode:
				this.mode ??
				(this.dashCommand === 'watch' ? 'development' : 'production'),
			requestJsonData: (dataPath: string) =>
				fetch(
					dataPath.replace(
						'data/',
						'https://raw.githubusercontent.com/bridge-core/editor-packages/main/'
					)
				).then((resp) => resp.json()),
		})
	}

	async run() {
		await this.dash.setup()
		console.log(this.dash.projectConfig.get())

		switch (this.dashCommand) {
			case 'build':
				await this.dash.build()
				break

			case 'watch':
				await new CLIWatcher(this.dash).watch()
				break

			default:
				break
		}
	}
}
