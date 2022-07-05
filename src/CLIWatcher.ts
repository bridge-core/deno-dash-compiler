import { Dash, debounce } from './deps.ts'

export class CLIWatcher {
	protected filesToUnlink = new Set<string>()
	protected filesToUpdate = new Set<string>()

	constructor(protected dash: Dash) {}

	async watch() {
		console.log(`Dash is starting to watch "${this.dash.projectRoot}"!`)

		const watcher = Deno.watchFs(this.dash.projectRoot)

		for await (const event of watcher) {
			if (event.kind === 'create' || event.kind === 'modify') {
				event.paths.forEach((path) => {
					this.filesToUpdate.add(path)
					this.filesToUnlink.delete(path)
				})
			} else if (event.kind === 'remove') {
				event.paths.forEach((path) => {
					this.filesToUnlink.add(path)
					this.filesToUpdate.delete(path)
				})
			}

			this.updateChangedFiles()
		}
	}

	updateChangedFiles = debounce(async () => {
		await this.dash.updateFiles([...this.filesToUpdate])
		await this.dash.unlinkMultiple([...this.filesToUnlink])

		this.filesToUpdate.clear()
		this.filesToUnlink.clear()
	}, 500)
}
