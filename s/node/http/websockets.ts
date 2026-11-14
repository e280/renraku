
import {Duplex} from "node:stream"
import {IncomingMessage} from "node:http"
import {WebSocket, WebSocketServer} from "ws"

export function websockets(
		accept: (websocket: WebSocket) => ((() => void) | Promise<() => void>),
	) {

	const wss = new WebSocketServer({noServer: true})

	return (request: IncomingMessage, socket: Duplex, head: Buffer) => {
		wss.handleUpgrade(request, socket, head, async websocket => {
			let closed = false
			let dispose: (() => void) | undefined

			websocket.addEventListener("close", () => {
				closed = true
				dispose?.()
			}, {once: true})

			try {
				dispose = await accept(websocket)
				if (closed) dispose()
			}
			catch (error) {
				console.error(error)
				websocket.close()
			}
		})
	}
}

