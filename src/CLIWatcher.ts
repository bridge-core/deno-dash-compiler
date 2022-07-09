import { Dash, debounce, path } from './deps.ts'

export class CLIWatcher {
	protected filesToUnlink = new Set<string>()
	protected filesToUpdate = new Set<string>()

	constructor(protected dash: Dash) {}

	get bridgeFolder() {
		return path.join(this.dash.projectRoot, '../..')
	}

	async watch() {
		console.log(`Dash is starting to watch "${this.dash.projectRoot}"!`)

		const watcher = Deno.watchFs(this.dash.projectRoot)

		for await (const event of watcher) {
			if (['success', 'other', 'any'].includes(event.kind)) continue

			event.paths.forEach((path) => {
				if (this.ignorePath(path)) return

				const transformed = this.transformPath(path)
				if (transformed.startsWith('builds/')) return
				console.log(transformed, path)

				if (event.kind === 'create' || event.kind === 'modify') {
					this.filesToUpdate.add(transformed)
					this.filesToUnlink.delete(transformed)
				} else if (event.kind === 'remove') {
					this.filesToUnlink.add(transformed)
					this.filesToUpdate.delete(transformed)
				}
			})

			this.updateChangedFiles()
		}
	}

	transformPath(filePath: string) {
		return path.relative(this.bridgeFolder, filePath).replace(/\\/g, '/')
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
			for (const file of this.filesToUpdate) {
				let stats
				try {
					stats = Deno.statSync(path.join(this.bridgeFolder, file))
				} catch {
					this.filesToUpdate.delete(file)
					this.filesToUnlink.add(file)
					return
				}

				if (!stats.isFile) this.filesToUpdate.delete(file)
			}

			if (this.filesToUpdate.size > 0) {
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
		200,
		{
			trailing: true,
		}
	)
}
