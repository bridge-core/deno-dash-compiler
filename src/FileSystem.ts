import { FileSystem, path, json5 } from './deps.ts'

export class DenoFileSystem extends FileSystem {
	constructor(protected baseDirectory: string = '') {
		super()
	}

	protected resolvePath(filePath: string) {
		// If filePath is absolute path or no baseDirectory is set, return filePath
		if (this.baseDirectory === '' || path.isAbsolute(filePath))
			return filePath

		// console.log(path.join(this.baseDirectory, filePath))
		return path.join(this.baseDirectory, filePath)
	}

	async readFile(filePath: string) {
		const fileData = await Deno.readFile(this.resolvePath(filePath))

		return new File([fileData], path.basename(filePath))
	}
	async writeFile(filePath: string, content: string | Uint8Array) {
		const dirPath = path.dirname(this.resolvePath(filePath))

		await Deno.mkdir(dirPath, {
			recursive: true,
		})

		if (typeof content === 'string')
			await Deno.writeTextFile(this.resolvePath(filePath), content)
		else return Deno.writeFile(this.resolvePath(filePath), content)
	}
	override async readJson(filePath: string) {
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
	override async copyFile(from: string, to: string, destFs = this) {
		// Fallback to slow path if destination fs !== this
		if (destFs !== this) return super.copyFile(from, to, destFs)

		const transformedTo = this.resolvePath(to)
		const dirPath = path.dirname(transformedTo)
		await Deno.mkdir(dirPath, {
			recursive: true,
		})

		await Deno.copyFile(this.resolvePath(from), transformedTo)
	}
	async mkdir(dirPath: string): Promise<void> {
		await Deno.mkdir(this.resolvePath(dirPath), { recursive: true })
	}
	async lastModified(filePath: string) {
		return (
			(await Deno.stat(this.resolvePath(filePath))).mtime?.getTime() ?? 0
		)
	}
}
