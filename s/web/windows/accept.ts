
import {deadline} from "@e280/stz"
import {acceptWindowPorts} from "./accepts.js"
import {defaultPortTimeout} from "../../consts.js"
import {PortResult, WindowAcceptOptions} from "./types.js"

export async function acceptWindowPort(
		options: WindowAcceptOptions & {timeout?: number}
	) {

	const {timeout = defaultPortTimeout} = options
	let stop = () => {}

	return deadline(timeout, new Promise<PortResult>(resolve => {
		stop = acceptWindowPorts({...options, onPort: (port, event) => {
			stop()
			resolve({port, event})
		}})
	})).finally(() => stop())
}

