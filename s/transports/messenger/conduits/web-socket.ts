
import type * as ws from "ws"
import {sub, Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {Ping, Pingponger, Pong} from "../../../tools/pingponger.js"

type InfraMessage = ["infra", Ping | Pong]
type RpcMessage = ["rpc", JsonRpc.Bidirectional]
type Message = InfraMessage | RpcMessage

export class WebSocketConduit extends Conduit {
	socket: WebSocket | ws.WebSocket
	pingponger: Pingponger
	onTimeout = sub()
	#trash = new Trash()

	constructor(public options: {
			socket: WebSocket | ws.WebSocket
			timeout: number
		}) {

		super()
		this.socket = options.socket

		const outgoingRpc = (json: JsonRpc.Bidirectional) =>
			this.socket.send(JSON.stringify(json))

		// sending rpc messages
		this.#trash.add(
			this.sendRequest.sub(outgoingRpc),
			this.sendResponse.sub(outgoingRpc),
		)

		// listen for incoming messages
		this.socket.addEventListener("message", this.#messageListener)
		this.#trash.add(() =>
			this.socket.removeEventListener("message", this.#messageListener))

		// establish ping ponger
		this.pingponger = new Pingponger({
			timeout: options.timeout,
			send: p => this.socket.send(
				JSON.stringify(<InfraMessage>["infra", p])
			),
		})

		// pingponger heartbeat
		this.#trash.add(
			this.pingponger.heartbeat(() => this.onTimeout.pub())
		)
	}

	#messageListener = async(e: {data: any, origin?: string}) => {
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

	dispose() {
		this.#trash.dispose()
	}
}

