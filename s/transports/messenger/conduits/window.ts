
import {Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {ChannelMessage} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class WindowConduit extends Conduit {
	#trash = new Trash()

	targetOrigin: string

	constructor(options: {
			localWindow: Window
			targetWindow: WindowProxy
			targetOrigin: string
			allow: (e: ChannelMessage) => boolean
		}) {

		super()
		const {localWindow, targetWindow, allow} = options
		this.targetOrigin = options.targetOrigin

		this.#trash.add(
			this.sendRequest.sub((m, transfer) =>
				targetWindow.postMessage(m, this.targetOrigin, transfer)),

			this.sendResponse.sub((m, transfer) =>
				targetWindow.postMessage(m, this.targetOrigin, transfer)),

			onMessage(localWindow, e => {
				if (allow(e))
					this.recv(e.data, e)
			}),
		)
	}

	dispose() {
		this.#trash.dispose()
	}
}

