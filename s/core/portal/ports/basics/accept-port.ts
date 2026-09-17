
import {Port} from "../../types.js"
import {Recv, Send} from "../types.js"
import {acceptPorts} from "./accept-ports.js"

export async function acceptPort(options: {send: Send, recv: Recv}) {
	return new Promise<Port>(resolve => {
		const stop = acceptPorts({...options, onPort: port => {
			stop()
			resolve(port)
		}})
	})
}

