import { FileSystem, path, json5 } from './deps.ts'

export class DenoFileSystem extends FileSystem {
	constructor(protected baseDirectory: string = '') {
		super()
	}

	protected resolvePath(filePath: string) {
		return path.join(this.baseDirectory, filePath)
	}

	async readFile(filePath: string) {
		const fileData = await Deno.readFile(this.resolvePath(filePath))

		return new File([fileData], path.basename(filePath))
	}
	async writeFile(filePath: string, content: string | Uint8Array) {
		await Deno.mkdir(path.dirname(this.resolvePath(filePath)), {
			recursive: true,
		})

		if (typeof content === 'string')
			await Deno.writeTextFile(this.resolvePath(filePath), content)
		else return Deno.writeFile(this.resolvePath(filePath), content)
	}
	async readJson(filePath: string) {
		const fileContent = await Deno.readTextFile(this.resolvePath(filePath))
		return json5.parse(fileContent)
	}
	async unlink(path: string) {
		await Deno.remove(this.resolvePath(path), { recursive: true })
	}
	async readdir(path: string) {
		const entries = []

		for await (const entry of Deno.readDir(this.resolvePath(path))) {
			entries.push(<const>{
				name: entry.name,
				kind: entry.isDirectory ? 'directory' : 'file',
			})
		}

		return entries
	}
	async mkdir(path: string): Promise<void> {
		await Deno.mkdir(this.resolvePath(path), { recursive: true })
	}
	async lastModified(filePath: string) {
		return (
			(await Deno.stat(this.resolvePath(filePath))).mtime?.getTime() ?? 0
		)
	}
}
