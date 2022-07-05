import { Dash, debounce } from './deps.ts'

export class CLIWatcher {
	protected filesToUnlink = new Set<string>()
	protected filesToUpdate = new Set<string>()

	constructor(protected dash: Dash) {}

	async watch() {
		console.log(`Dash is starting to watch "${this.dash.projectRoot}"!`)

		const watcher = Deno.watchFs(this.dash.projectRoot)

		for await (const event of watcher) {
			if (['success', 'other', 'any'].includes(event.kind)) continue

			if (event.kind === 'create' || event.kind === 'modify') {
				event.paths.forEach((path) => {
					if (this.ignorePath(path)) return

					this.filesToUpdate.add(path.replace(/\\/g, '/'))
					this.filesToUnlink.delete(path.replace(/\\/g, '/'))
				})
			} else if (event.kind === 'remove') {
				event.paths.forEach((path) => {
					if (this.ignorePath(path)) return

					this.filesToUnlink.add(path.replace(/\\/g, '/'))
					this.filesToUpdate.delete(path.replace(/\\/g, '/'))
				})
			}

			this.updateChangedFiles()
		}
	}

	ignorePath(path: string) {
		return (
			path.endsWith('.crswap') ||
			path.endsWith('.DS_Store') ||
			path.includes('.bridge')
		)
	}

	updateChangedFiles = debounce(
		async () => {
			if (this.filesToUpdate.size > 0) {
				console.log(
					'Dash: Updating',
					[...this.filesToUpdate].join(', ')
				)
				await this.dash.updateFiles([...this.filesToUpdate])
			}

			if (this.filesToUnlink.size > 0) {
				console.log(
					'Dash: Unlinking',
					[...this.filesToUnlink].join(', ')
				)
				await this.dash.unlinkMultiple([...this.filesToUnlink])
			}

			this.filesToUpdate.clear()
			this.filesToUnlink.clear()
		},
		1000,
		{
			trailing: true,
		}
	)
}
