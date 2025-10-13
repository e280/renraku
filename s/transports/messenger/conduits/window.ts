
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {MessageLike} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class WindowConduit extends Conduit {
	targetOrigin: string
	dispose = disposer()

	constructor(options: {
			localWindow: Window
			targetWindow: WindowProxy
			targetOrigin: string
			allow: (e: MessageLike) => boolean
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
				if (allow(e))
					this.recv(e.data, e)
			}),
		)
	}
}

