import { CLIWatcher } from './CLIWatcher.ts'
import { comMojangFolder } from './comMojangFolder.ts'
import { Dash, flags, isMatch, path } from './deps.ts'
import { DenoFileSystem } from './FileSystem.ts'
import { FileTypeImpl, PackTypeImpl } from './McProjectCore.ts'

interface IDashOptions {
	mode: 'development' | 'production'
	compilerConfig?: string
	out?: string
}
export class CLI {
	protected fs = new DenoFileSystem()

	async createDashService({ mode, compilerConfig, out }: IDashOptions) {
		console.log(out)
		const outFs = out ? new DenoFileSystem(out) : undefined

		const dash = new Dash(this.fs, outFs, {
			config: path.join(Deno.cwd(), 'config.json'),
			compilerConfig: compilerConfig
				? path.join(Deno.cwd(), compilerConfig)
				: undefined,
			packType: new PackTypeImpl(undefined),
			fileType: new FileTypeImpl(undefined, isMatch),
			mode,

			requestJsonData: (dataPath: string) =>
				fetch(
					dataPath.replace(
						'data/',
						'https://raw.githubusercontent.com/bridge-core/editor-packages/main/'
					)
				).then((resp) => resp.json()),
		})

		await dash.setup()

		return dash
	}

	async build(options: IDashOptions) {
		const dash = await this.createDashService(options)
		await dash.build()
		console.log(dash.isCompilerActivated, options.compilerConfig)
	}
	async watch(options: IDashOptions) {
		const dash = await this.createDashService(options)
		await dash.build()
		await new CLIWatcher(dash).watch()
	}
}
