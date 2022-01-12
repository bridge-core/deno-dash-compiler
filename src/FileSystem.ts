import { FileSystem, path } from './deps.ts'

export class DenoFileSystem extends FileSystem {
	async readFile(filePath: string): Promise<File> {
		const fileData = await Deno.readFile(filePath)

		return new File([fileData], path.basename(filePath))
	}
	async writeFile(
		filePath: string,
		content: string | Uint8Array
	): Promise<void> {
		await Deno.mkdir(path.dirname(filePath), { recursive: true })
		if (typeof content === 'string')
			await Deno.writeTextFile(filePath, content)
		else return Deno.writeFile(filePath, content)
	}
	async unlink(fPath: string): Promise<void> {
		await Deno.remove(fPath, { recursive: true })
	}
	async readdir(path: string) {
		let entries = []

		for await (const entry of await Deno.readDir(path)) {
			entries.push({
				name: entry.name,
				kind: entry.isDirectory ? 'directory' : 'file',
			})
		}

		return entries
	}
	async mkdir(path: string): Promise<void> {
		await Deno.mkdir(path, { recursive: true })
	}
	async lastModified(filePath: string): Promise<number> {
		return (await Deno.stat(filePath)).mtime?.getTime() ?? 0
	}
}
