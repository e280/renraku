
import {deadline} from "@e280/stz"
import {acceptWindowPorts} from "./accepts.js"
import {defaultRemoteTimeout} from "../../consts.js"
import {PortResult, WindowAcceptOptions} from "./types.js"

export async function acceptWindowPort(
		options: WindowAcceptOptions & {timeout?: number}
	) {

	const {timeout = defaultRemoteTimeout} = options
	let stop = () => {}

	const promise = new Promise<PortResult>(resolve => {
		stop = acceptWindowPorts({...options, onPort: (port, event) => {
			stop()
			resolve({port, event})
		}})
	})

	return deadline(timeout, promise)
		.finally(() => stop())
}

