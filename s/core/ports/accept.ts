
import {deadline} from "@e280/stz"
import {acceptPorts} from "./accepts.js"
import {Port} from "../transport/types.js"
import {Accept, Recv, Send} from "./types.js"

export async function acceptPort(options: {
		send: Send<Accept>,
		recv: Recv,
		timeout: number
	}) {

	let stop = () => {}

	return deadline(options.timeout, new Promise<Port>(resolve => {
		stop = acceptPorts({...options, onPort: port => {
			stop()
			resolve(port)
		}})
	})).finally(() => stop())
}

