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
            cmd: ['CheckNetIsolation.exe', 'LoopbackExempt', '-a', '-n=microsoft.minecraftuwp_8wekyb3d8bbwe'],
            stdout: 'null',
        })
        const retailStat = await retail.status()
        if (retailStat.code !== 0)
            console.log('Unable to set network loopback exemption for Minecraft retail build.')
        retail.close()

        // Minecraft Preview Build
        const preview = Deno.run({
            cmd: ['CheckNetIsolation.exe', 'LoopbackExempt', '-a', '-n=Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe'],
            stdout: 'null',
        })
        const previewStat = await preview.status()
        if (previewStat.code !== 0)
            console.log('Unable to set network loopback exemption for Minecraft preview build.')
        preview.close()
    }
}
