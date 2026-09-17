
import {Port} from "../../types.js"
import {acceptPorts} from "./accepts.js"
import {Accept, Recv, Send} from "../types.js"

export async function acceptPort(options: {send: Send<Accept>, recv: Recv}) {
	return new Promise<Port>(resolve => {
		const stop = acceptPorts({...options, onPort: port => {
			stop()
			resolve(port)
		}})
	})
}

