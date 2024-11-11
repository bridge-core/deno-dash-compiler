export class WebSocketServer {
	protected socket?: WebSocket

	/**
	 * Whether the WebSocket is open
	 */
	get isStarted() {
		return (this.socket?.readyState === WebSocket.OPEN)
	}

	/**
	 * Open a WebSocket on localhost
	 * @param port Network port to open the socket on
	 */
	start(port: number) {
		this.setLoopbackExemption()

		Deno.serve({ port: port }, (req) => {
			if (req.headers.get('upgrade') != 'websocket') {
				console.log('Websocket connection: Upgrade header not found')
			}
			const { socket, response } = Deno.upgradeWebSocket(req)
			this.socket = socket
			const intervalId = this.keepAlive()
			socket.addEventListener('close', () => {
				clearInterval(intervalId)
				console.log('WebSocket connection closed!')
			})
			return response
		})
	}

	/**
	 * Runs a console command inside of Minecraft, if the WebSocket is still open
	 * @param command The command to be run (without the slash)
	 * @returns The response from Minecraft after requesting the command to be run
	 */
	runCommand(command: string) {
		const requestId = crypto.randomUUID()
		const data = JSON.stringify({
			header: {
				version: 1,
				requestId,
				messageType: 'commandRequest',
				messagePurpose: 'commandRequest',
			},
			body: {
				commandLine: command,
			},
		})
		if (this.socket && this.isStarted) {
			this.socket.send(data)
			return new Promise<{ message: string, status: number }>((resolve) => {
					this.socket?.addEventListener('message', (event) => {
						const res = JSON.parse(event.data.toString())
						if (res.header.requestId === requestId) {
							resolve({
								message: res.body.statusMessage,
								status: res.body.statusCode,
							})
						}
					})
				}
			)
		}
	}

	/**
	 * Runs console commands to set both Minecraft retail and preview clients to be exempt from UWP network loopback restrictions so that the clients can connect to a local WebSocket
	 */
	async setLoopbackExemption() {
		// Minecraft Retail Build
		const retailCommand = new Deno.Command('CheckNetIsolation.exe', {
			args: ['LoopbackExempt', '-a', '-n=microsoft.minecraftuwp_8wekyb3d8bbwe']
		})
		const { success: retailSuccess } = await retailCommand.output()
		if (!retailSuccess) {
			console.log('Unable to set network loopback exemption for Minecraft retail build.')
		}

		// Minecraft Preview Build
		const previewCommand = new Deno.Command('CheckNetIsolation.exe', {
			args: ['LoopbackExempt', '-a', '-n=Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe']
		})
		const { success: previewSuccess } = await previewCommand.output()
		if (!previewSuccess) {
			console.log('Unable to set network loopback exemption for Minecraft preview build.')
		}
	}

	/**
	 * Sends empty requests to the client every 25 seconds to stop the connection from timing out
	 * @returns The interval id (use to cancel when WebSocket is closed)
	 */
	keepAlive() {
		return setInterval(() => {
			this.socket?.send('')
		}, 25000)
	}
}
