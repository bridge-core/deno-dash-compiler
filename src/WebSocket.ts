export class WebSocketServer {
    protected socket?: WebSocket

    get isStarted() {
        return (this.socket?.OPEN ?? 0) > 0
    }

    start(port: number) {
        this.setLoopbackExemption()

        const listener = Deno.listen({ port })
        listener.accept().then(async (connection) => {
            const httpConnection = Deno.serveHttp(connection)
            for await (const event of httpConnection) {
                const { socket, response } = Deno.upgradeWebSocket(event.request)
                this.socket = socket
                await event.respondWith(response)
                console.log('WebSocket connection established!')
                this.socket.onclose = () => console.log('WebSocket connection closed!')
            }
        })
    }

    runCommand(command: string) {
        const requestId = crypto.randomUUID()
        const data = JSON.stringify({
            header: {
                version: 1,
                requestId,
                messageType: 'commandRequest',
                messagePurpose: "commandRequest",
            },
            body: {
                commandLine: command,
            },
        })
        if (this.socket && this.isStarted) this.socket.send(data)
    }

    async setLoopbackExemption() {
        // Minecraft Retail Build
        const retail = Deno.run({
            cmd: ['CheckNetIsolation.exe', 'LoopbackExempt', '-a', '-p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436'],
            stdout: 'piped',
        })
        // Minecraft Preview Build
        const preview = Deno.run({
            cmd: ['CheckNetIsolation.exe', 'LoopbackExempt', '-a', '-p=S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476'],
            stdout: 'piped',
        })

        const isSuccess = (out: string) => out === 'OK.'
        const decoder = new TextDecoder()
        const retailOutput = decoder.decode(await retail.output()).trim()
        const previewOutput = decoder.decode(await preview.output()).trim()
        if (!isSuccess(retailOutput)) console.log('Unable to set network loopback exemption for Minecraft retail build.')
        if (!isSuccess(previewOutput)) console.log('Unable to set network loopback exemption for Minecraft preview build.')
    }
}
