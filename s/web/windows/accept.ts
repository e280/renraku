
import {webPortAccepts} from "./accepts.js"
import {WebAcceptOptions} from "./utils.js"
import {Port} from "../../core/portal/types.js"

export async function webPortAccept(options: WebAcceptOptions) {
	return new Promise<Port>(resolve => {
		const stop = webPortAccepts({...options, onPort: port => {
			stop()
			resolve(port)
		}})
	})
}

