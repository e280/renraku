
import {acceptWindowPorts} from "./accepts.js"
import {PortResult, WindowAcceptOptions} from "./types.js"

export async function acceptWindowPort(options: WindowAcceptOptions) {
	return new Promise<PortResult>(resolve => {
		const stop = acceptWindowPorts({...options, onPort: (port, event) => {
			stop()
			resolve({port, event})
		}})
	})
}

