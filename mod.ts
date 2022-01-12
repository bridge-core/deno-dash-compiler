import { path, flags, Dash, isMatch, PackType, FileType } from './src/deps.ts'
import { DenoFileSystem } from './src/FileSystem.ts'
import fileDefinitions from './src/fileDefinitions.json' assert { type: 'json' }

if (import.meta.main) {
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

	const { _ } = flags.parse(Deno.args)

	switch (_[0]) {
		case 'build':
			await dash.build()
			break

		default:
			break
	}
}
