// deno-lint-ignore-file no-explicit-any
import { CLIWatcher } from './CLIWatcher.ts'
import { comMojangFolder, previewComMojangFolder } from './comMojangFolder.ts'
import { Dash, isMatch } from './deps.ts'
import { DenoFileSystem } from './FileSystem.ts'
import { FileTypeImpl, PackTypeImpl } from './McProjectCore.ts'

interface IDashOptions {
	mode: 'development' | 'production'
	compilerConfig?: string
	out?: string | null
	reload?: number
}
export class CLI {
	protected fs = new DenoFileSystem()

	async createDashService({ mode, compilerConfig, out }: IDashOptions) {
		const outFs = out ? new DenoFileSystem(out) : undefined

		const dash = new Dash(this.fs, outFs, {
			config: await this.getProjectConfig(),
			compilerConfig: compilerConfig ?? undefined,
			packType: <any>new PackTypeImpl(undefined),
			fileType: <any>new FileTypeImpl(undefined, isMatch),
			mode,
			verbose: true,

			requestJsonData: (dataPath: string) => fetch(dataPath.replace('data/', 'https://raw.githubusercontent.com/bridge-core/editor-packages/main/')).then(resp => resp.json()),
		})

		await dash.setup()

		return dash
	}

	verifyOptions(options: IDashOptions) {
		if (options.out === 'preview') {
			options.out = previewComMojangFolder ?? undefined
		}

		// Fallback to com.mojang folder by default in development mode
		if (options.mode === 'development' && options.out === undefined) {
			options.out = comMojangFolder ?? undefined
		}
	}

	async getProjectConfig() {
		let projectConfigPath = ''
		try {
			await this.fs.readFile('dash-config.json')
			projectConfigPath = './dash-config.json'
		} catch (_error) {
			projectConfigPath = './config.json'
		}
		return projectConfigPath
	}

	async build(options: IDashOptions) {
		this.verifyOptions(options)

		const dash = await this.createDashService(options)
		await dash.build()
	}
	async watch(options: IDashOptions) {
		this.verifyOptions(options)
		const dash = await this.createDashService(options)

		await dash.build()
		await new CLIWatcher(dash).watch(options.reload)
	}
}
