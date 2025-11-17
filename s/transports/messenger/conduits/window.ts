
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {ChannelMessage} from "../types.js"
import {is_valid_json_rpc_message, onMessage} from "../parts/helpers.js"

export class WindowConduit extends Conduit {
	targetOrigin: string
	dispose = disposer()

	constructor(options: {
			localWindow: Window
			targetWindow: WindowProxy
			targetOrigin: string
			allow: (e: ChannelMessage) => boolean
		}) {

		super()
		const {localWindow, targetWindow, allow} = options
		this.targetOrigin = options.targetOrigin

		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) =>
				targetWindow.postMessage(m, this.targetOrigin, transfer)),

			this.sendResponse.sub((m, transfer) =>
				targetWindow.postMessage(m, this.targetOrigin, transfer)),

			onMessage(localWindow, e => {
				if (allow(e) && is_valid_json_rpc_message(e.data))
					this.recv(e.data, e)
			}),
		)
	}
}

