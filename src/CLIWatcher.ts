import { Dash, debounce, path } from "./deps.ts";
import { WebSocketServer } from "./WebSocket.ts";

const outputFolderPattern = path.globToRegExp("projects/*/builds/**");
export class CLIWatcher {
	protected filesToUnlink = new Set<string>();
	protected filesToUpdate = new Set<string>();

	constructor(protected dash: Dash) {}

	async watch(reloadPort?: number) {
		console.log(
			`Dash is starting to watch "${path.resolve(this.dash.projectRoot)}"!`,
		);

		const watcher = Deno.watchFs(this.dash.projectRoot);
		const wsServer = new WebSocketServer();
		if (reloadPort) {
			wsServer.start(reloadPort);
			console.log(
				`Auto Reloader: WebSocket is running on port ${reloadPort}.`,
			);
			console.log(
				`Auto Reloader: Connect in Minecraft by running "/connect localhost:${reloadPort}".`,
			);
		}

		for await (const event of watcher) {
			if (["success", "other", "any"].includes(event.kind)) continue;

			event.paths.forEach((path) => {
				const transformed = this.transformPath(path);

				if (this.ignorePath(transformed)) return;
				if (transformed.match(outputFolderPattern)) return;

				if (event.kind === "create" || event.kind === "modify") {
					this.filesToUpdate.add(transformed);
					this.filesToUnlink.delete(transformed);
				} else if (event.kind === "remove") {
					this.filesToUnlink.add(transformed);
					this.filesToUpdate.delete(transformed);
				}
			});

			this.updateChangedFiles(reloadPort ? wsServer : undefined);
		}
	}

	transformPath(filePath: string) {
		return path
			.relative(this.dash.projectRoot, filePath)
			.replace(/\\/g, "/");
	}

	ignorePath(filePath: string) {
		return (
			filePath.endsWith(".crswap") ||
			filePath.endsWith(".DS_Store") ||
			filePath.startsWith(".bridge") ||
			filePath.startsWith(".git")
		);
	}

	updateChangedFiles = debounce(async (wss?: WebSocketServer) => {
		for (const file of this.filesToUpdate) {
			let stats;
			try {
				stats = Deno.statSync(path.join(this.dash.projectRoot, file));
			} catch {
				this.filesToUpdate.delete(file);
				this.filesToUnlink.add(file);
				return;
			}

			if (!stats.isFile) this.filesToUpdate.delete(file);
		}

		if (this.filesToUpdate.size > 0) {
			await this.dash.updateFiles([...this.filesToUpdate]);
		}

		if (this.filesToUnlink.size > 0) {
			console.log("Dash: Unlinking", [...this.filesToUnlink].join(", "));
			await this.dash.unlinkMultiple([...this.filesToUnlink]);
		}
		if (wss && wss.isStarted) {
			const isScriptOrFunction = (p: string) =>
				path.extname(p) === ".mcfunction" ||
				path.extname(p) === ".js" ||
				path.extname(p) === ".ts";
			if (
				[...this.filesToUpdate, ...this.filesToUnlink].some((file) => isScriptOrFunction(file))
			) {
				const { status, message } = (await wss.runCommand("reload")) ??
					{};
				if (status === 0) {
					wss.runCommand(
						'tellraw @s {"rawtext":[{"text":"Dash Auto Reloader has reloaded functions and scripts"}]}',
					);
				} else {
					wss.runCommand(
						`tellraw @s {"rawtext":[{"text":"Dash Auto Reloader failed to reload functions and scripts. \nError message: ${message}"}]}`,
					);
				}
			}
		}

		this.filesToUpdate.clear();
		this.filesToUnlink.clear();
	}, 200);
}
