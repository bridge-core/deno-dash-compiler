import { FileType, PackType } from './deps.ts'

export class PackTypeImpl extends PackType<void> {
	async setup() {
		this.packTypes = await fetch(
			'https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/packDefinitions.json'
		).then((resp) => resp.json())
	}
}
export class FileTypeImpl extends FileType<void> {
	async setup() {
		this.fileTypes = await fetch(
			'https://raw.githubusercontent.com/bridge-core/editor-packages/main/dist/minecraftBedrock/fileDefinitions.json'
		).then((resp) => resp.json())
	}
}
