
import {Duplex} from "node:stream"
import {WebSocketServer} from "ws"
import {cycle, Json, nap, pipe, Rollerstat} from "@e280/stz"
import {createServer, IncomingMessage} from "node:http"

import {heartbeatInterval} from "../../consts.js"
import {Messenger} from "../../core/messenger/messenger.js"
import {Pingpong} from "../../core/transport/utils/pingpong.js"

type Jsock = {
	close: () => void
	send: (json: Json) => void
}

type JsockHandlers = {
	messaged: (json: Json) => void
	closed: (code: number) => void
	errored: (error: Error) => void
}

type JsockFn = (jsock: Jsock) => JsockHandlers

export function jsock(connected: JsockFn) {
	const wss = new WebSocketServer({noServer: true})

	wss.on("connection", ws => {
		const handlers = connected({
			close: () => ws.close(),
			send: json => ws.send(JSON.stringify(json)),
		})

		ws.on("error", handlers.errored)
		ws.on("close", handlers.closed)

		ws.on("message", o => pipe(o)
			.to(String)
			.to(JSON.parse)
			.to(handlers.messaged)
			.done())
	})

	return (request: IncomingMessage, socket: Duplex, head: any) => {
		wss.handleUpgrade(request, socket, head, ws => wss.emit("connection", ws, request))
	}
}

type Msock = {
	rtt: Rollerstat
	close: () => void
}

type MsockHandlers = {
	messenger: Messenger
	closed: (code: number) => void
	errored: (error: Error) => void
}

type MsockFn = (msock: Msock) => MsockHandlers

export function msock(connected: MsockFn): JsockFn {
	return (jsock: Jsock): JsockHandlers => {
		const pingpong = new Pingpong({
			send: jsock.send,
			forward: o => connection.messenger.recv(o as any),
		})

		const connection = connected({
			rtt: pingpong.rtt,
			close: jsock.close,
		})

		connection.messenger.onSend(pingpong.sendData)

		const stopHeartbeat = cycle(async() => {
			await pingpong.ping().catch(() => jsock.close())
			await nap(heartbeatInterval)
		})

		return {
			messaged: json => pingpong.recv(json as any),
			errored: connection.errored,
			closed: code => {
				stopHeartbeat()
				pingpong.dispose()
				connection.closed(code)
			},
		}
	}
}

// // usage
//
// createServer()
// 	.on("upgrade", jsock(msock(({close}) => ({
// 		messenger: new Messenger(),
// 		errored: error => console.error(error),
// 		closed: () => {},
// 	}))))
// 	.listen(8080)

