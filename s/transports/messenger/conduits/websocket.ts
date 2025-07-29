
import type * as ws from "ws"
import {Trash, ev} from "@e280/stz"

import {Conduit} from "./conduit.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {Ping, Pingponger, Pong} from "../../../tools/pingponger.js"

type InfraMessage = ["infra", Ping | Pong]
type RpcMessage = ["rpc", JsonRpc.Bidirectional]
type Message = InfraMessage | RpcMessage

export class WebsocketConduit extends Conduit {
	socket: WebSocket | ws.WebSocket
	pingponger: Pingponger
	#trash = new Trash()

	constructor(options: {
			socket: WebSocket | ws.WebSocket
			timeout: number
			onError: (error: any) => void
			onClose: () => void
		}) {

		super()
		const {socket, timeout, onClose, onError} = options
		this.socket = socket

		// sending rpc messages
		this.#trash.add(
			this.sendRequest.sub(this.#sendRpc),
			this.sendResponse.sub(this.#sendRpc),
		)

		// listening to socket events
		this.#trash.add(
			ev(this.socket, {
				error: onError,
				close: onClose,
				message: this.#handleMessage,
			})
		)

		// establish pingponger
		this.pingponger = new Pingponger({
			timeout,
			send: p => this.socket.send(
				JSON.stringify(<InfraMessage>["infra", p])
			),
		})

		// establish pingponger heartbeat
		this.#trash.add(
			this.pingponger.heartbeat(() => {
				if (this.socket.readyState === 1)
					this.socket.close()
				onClose()
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

	/** clean up this conduit, detaching socket listeners. does not close the socket. */
	dispose() {
		this.#trash.dispose()
	}
}

