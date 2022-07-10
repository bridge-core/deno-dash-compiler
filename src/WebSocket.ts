export class WebSocketServer {
    protected socket?: WebSocket

    get isStarted() {
        return (this.socket?.OPEN ?? 0) > 0
    }

    start(port: number) {
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
}
