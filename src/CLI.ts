import { CLIWatcher } from './CLIWatcher.ts'
import { previewComMojangFolder } from './comMojangFolder.ts'
import { Dash, isMatch, path } from './deps.ts'
import { DenoFileSystem } from './FileSystem.ts'
import { FileTypeImpl, PackTypeImpl } from './McProjectCore.ts'

interface IDashOptions {
	mode: 'development' | 'production'
	compilerConfig?: string
	out?: string | null
}
export class CLI {
	protected fs = new DenoFileSystem(path.join(Deno.cwd(), '../..'))

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

	verifyOptions(options: IDashOptions) {
		if (options.out === 'preview') {
			options.out = previewComMojangFolder ?? undefined
		}
	}

	async build(options: IDashOptions) {
		this.verifyOptions(options)

		const dash = await this.createDashService(options)
		await dash.build()
		console.log(dash.isCompilerActivated, options.compilerConfig)
	}
	async watch(options: IDashOptions) {
		this.verifyOptions(options)

		const dash = await this.createDashService(options)
		await dash.build()
		await new CLIWatcher(dash).watch()
	}
}
