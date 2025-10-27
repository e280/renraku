
import {disposer} from "@e280/stz"
import {MessageLike} from "../types.js"
import {onMessage} from "../parts/helpers.js"
import {Conduit} from "../../../universal/messenger/conduits/conduit.js"

export class WindowConduit extends Conduit {
	targetOrigin: string
	dispose = disposer().schedule(() => super.dispose())

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

	static windowConduitAlice(options: {
			aliceWindow: Window | WindowProxy
			bobWindow: Window | WindowProxy
			bobOrigin: string
		}) {

		return new WindowConduit({
			localWindow: options.aliceWindow,
			targetWindow: options.bobWindow,
			targetOrigin: options.bobOrigin,
			allow: e => (
				e.source === options.bobWindow &&
				e.origin === options.bobOrigin
			),
		})
	}

	static windowConduitBob(options: {
			aliceWindow: Window | WindowProxy
			bobWindow: Window | WindowProxy
			aliceOrigin?: string
			bobOrigin: string
		}) {

		return new WindowConduit({
			localWindow: options.bobWindow,
			targetWindow: options.aliceWindow,
			targetOrigin: options.aliceOrigin ?? "*",
			allow: e => (
				(e.source === options.aliceWindow) &&
				(options.aliceOrigin !== undefined
					? e.origin === options.aliceOrigin
					: true)
			),
		})
	}
}

