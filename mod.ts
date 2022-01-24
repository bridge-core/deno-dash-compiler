import { path, flags, Dash, isMatch, PackType, FileType } from './src/deps.ts'
import { DenoFileSystem } from './src/FileSystem.ts'
import fileDefinitions from './src/fileDefinitions.json' assert { type: 'json' }

// @ts-ignore
window.global = window
// @ts-ignore
window.process = {
	cwd: () => '',
	env: {},
}

if (import.meta.main) {
	const { _, c } = flags.parse(Deno.args)

	const fs = new DenoFileSystem()
	class PackTypeImpl extends PackType {
		async setup() {
			this.packTypes = await fetch(
				'https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/packDefinitions.json'
			).then((resp) => resp.json())
		}
	}
	class FileTypeImpl extends FileType {
		async setup() {
			this.fileTypes = fileDefinitions
		}
	}
	const dash = new Dash(fs, undefined, {
		config: path.join(Deno.cwd(), 'config.json'),
		compilerConfig: c ? path.join(Deno.cwd(), c) : undefined,
		packType: new PackTypeImpl(undefined),
		fileType: new FileTypeImpl(undefined, isMatch),
		mode: 'production',
		requestJsonData: (dataPath: string) =>
			fetch(
				dataPath.replace(
					'data/',
					'https://raw.githubusercontent.com/bridge-core/editor-packages/main/'
				)
			).then((resp) => resp.json()),
	})

	await dash.setup()

	switch (_[0]) {
		case 'build':
			await dash.build()
			break

		default:
			break
	}
}
