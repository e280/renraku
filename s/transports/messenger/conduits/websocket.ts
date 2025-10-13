
import type * as ws from "ws"
import {disposer, ev} from "@e280/stz"

import {Conduit} from "./conduit.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {Ping, Pingponger, Pong} from "../../../tools/pingponger.js"

type InfraMessage = ["infra", Ping | Pong]
type RpcMessage = ["rpc", JsonRpc.Bidirectional]
type Message = InfraMessage | RpcMessage

export class WebsocketConduit extends Conduit {
	socket: WebSocket | ws.WebSocket
	pingponger: Pingponger

	/** clean up this conduit, detaching socket listeners. does not close the socket. */
	dispose = disposer().schedule(() => super.dispose())

	constructor(options: {
			socket: WebSocket | ws.WebSocket
			timeout: number
			onError: (error: any) => void
			onClose: () => void
		}) {

		super()
		this.socket = options.socket

		// sending rpc messages
		this.dispose.schedule(
			this.sendRequest.sub(this.#sendRpc),
			this.sendResponse.sub(this.#sendRpc),
		)

		// listening to socket events
		this.dispose.schedule(
			ev(this.socket, {
				error: error => {
					this.dispose()
					options.onError(error)
				},
				close: () => {
					this.dispose()
					options.onClose()
				},
				message: this.#handleMessage,
			})
		)

		// establish pingponger
		this.pingponger = new Pingponger({
			timeout: options.timeout,
			send: p => this.socket.send(
				JSON.stringify(<InfraMessage>["infra", p])
			),
		})

		// establish pingponger heartbeat
		this.dispose.schedule(
			this.pingponger.heartbeat(() => {
				if (this.socket.readyState === 1)
					this.socket.close()
				this.dispose()
				options.onClose()
			})
		)
	}

	#sendRpc = (json: JsonRpc.Bidirectional) => {
		const message: RpcMessage = ["rpc", json]
		const text = JSON.stringify(message)
		this.socket.send(text)
	}

	#handleMessage = async(e: {data: any, origin?: string}) => {
		const message = JSON.parse(e.data.toString()) as Message
		switch (message[0]) {
			case "infra":
				this.pingponger.recv(message[1])
				break

			case "rpc":
				await this.recv(message[1], {origin: e.origin ?? ""})
				break

			default:
				throw new Error("message listener")
		}
	}
}

