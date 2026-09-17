
import {acceptWindowPorts} from "./accepts.js"
import {WindowAcceptOptions} from "./utils.js"
import {Port} from "../../core/portal/types.js"

export async function acceptWindowPort(options: WindowAcceptOptions) {
	return new Promise<Port>(resolve => {
		const stop = acceptWindowPorts({...options, onPort: port => {
			stop()
			resolve(port)
		}})
	})
}

