
import {Duplex} from "node:stream"
import {IncomingMessage} from "node:http"
import {WebSocket, WebSocketServer} from "ws"

export function websockets(accept: (websocket: WebSocket) => Promise<void>) {
	const wss = new WebSocketServer({noServer: true})

	return (request: IncomingMessage, socket: Duplex, head: Buffer) => {
		wss.handleUpgrade(request, socket, head, async websocket => {
			await accept(websocket).catch(error => {
				console.error(error)
				websocket.terminate()
			})
		})
	}
}

