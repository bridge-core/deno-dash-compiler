import { Dash, debounce, path } from './deps.ts'
import { WebSocketServer } from './WebSocket.ts'

const outputFolderPattern = path.globToRegExp('projects/*/builds/**')
export class CLIWatcher {
	protected filesToUnlink = new Set<string>()
	protected filesToUpdate = new Set<string>()

	constructor(protected dash: Dash) {}

	async watch(reloadPort?: number) {
		console.log(`Dash is starting to watch "${this.dash.projectRoot}"!`)

		const watcher = Deno.watchFs(this.dash.projectRoot)
		const wsServer = new WebSocketServer()
		if (reloadPort) {
			wsServer.start(reloadPort)
			console.log(`Auto Reloader: WebSocket is running on port ${reloadPort}.`)
			console.log(`Auto Reloader: Connect in Minecraft by running "/connect localhost:${reloadPort}".`)
		}

		for await (const event of watcher) {
			if (['success', 'other', 'any'].includes(event.kind)) continue

			event.paths.forEach((path) => {
				if (this.ignorePath(path)) return

				const transformed = this.transformPath(path)
				if (transformed.match(outputFolderPattern)) return

				if (event.kind === 'create' || event.kind === 'modify') {
					this.filesToUpdate.add(transformed)
					this.filesToUnlink.delete(transformed)
				} else if (event.kind === 'remove') {
					this.filesToUnlink.add(transformed)
					this.filesToUpdate.delete(transformed)
				}
			})

			this.updateChangedFiles(reloadPort ? wsServer : undefined)
		}
	}

	transformPath(filePath: string) {
		return path
			.relative(this.dash.projectRoot, filePath)
			.replace(/\\/g, '/')
	}

	ignorePath(path: string) {
		return (
			path.endsWith('.crswap') ||
			path.endsWith('.DS_Store') ||
			path.includes('.bridge')
		)
	}

	updateChangedFiles = debounce(
		async (wss?: WebSocketServer) => {
			for (const file of this.filesToUpdate) {
				let stats
				try {
					stats = Deno.statSync(
						path.join(this.dash.projectRoot, file)
					)
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
			if (wss && wss.isStarted) {
				const isScriptOrFunction = (p: string) => path.extname(p) === '.mcfunction' || path.extname(p) === '.js' || path.extname(p) === '.ts'
				for (const file of this.filesToUpdate) {
					if (isScriptOrFunction(file)) {
						wss.runCommand('reload')
						wss.runCommand('tellraw @s {"rawtext":[{"text":"Dash Auto Reloader has reloaded functions and scripts"}]}')
					}
				}
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
