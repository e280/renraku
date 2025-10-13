
import {Messenger} from "./messenger.js"
import {AsFns, Fns} from "../../core/types.js"
import {PortConduit} from "./conduits/port.js"
import {tune} from "../../core/remote-proxy.js"
import {WindowConduit} from "./conduits/window.js"
import {MessengerOptions, MessengerRpc} from "./types.js"

export type BridgeOptions = {
	opener: Window | WindowProxy,
	popup: Window | WindowProxy,
	popupOrigin: string
	openerOrigin?: string
}

export type HandshakerFns = AsFns<{
	handshake(port: MessagePort): Promise<void>
}>

export function bridge<
		OpenerFns extends Fns = any,
		PopupFns extends Fns = any,
	>(bridgeOptions: BridgeOptions) {

	type OpenerOptions = {
		rpc: MessengerRpc<OpenerFns, PopupFns>
	} & Omit<MessengerOptions<OpenerFns, PopupFns>, "conduit" | "rpc">

	type PopupOptions = {
		rpc: MessengerRpc<PopupFns, OpenerFns>
	} & Omit<MessengerOptions<PopupFns, OpenerFns>, "conduit" | "rpc">

	async function opener(openerOptions: OpenerOptions) {
		const {port1, port2} = new MessageChannel()

		const handshakerConduit = new WindowConduit({
			localWindow: bridgeOptions.opener,
			targetWindow: bridgeOptions.popup,
			targetOrigin: bridgeOptions.popupOrigin,
			allow: e => (
				e.source === bridgeOptions.popup &&
				e.origin === bridgeOptions.popupOrigin
			),
		})

		const handshaker = new Messenger<{}, HandshakerFns>({
			conduit: handshakerConduit,
		})

		try {
			await handshaker.remote.handshake[tune]({transfer: [port2]})(port2)
		}
		finally {
			handshaker.dispose()
			handshakerConduit.dispose()
		}

		const conduit = new PortConduit(port1)
		const messenger = new Messenger<OpenerFns, PopupFns>({
			...openerOptions,
			conduit,
			rpc: openerOptions.rpc,
		})
		port1.start()

		return {messenger, conduit}
	}

	async function popup(popupOptions: PopupOptions) {
		return new Promise<{messenger: Messenger<PopupFns, OpenerFns>, conduit: PortConduit}>(resolve => {
			const handshakerConduit = new WindowConduit({
				localWindow: bridgeOptions.popup,
				targetWindow: bridgeOptions.opener,
				targetOrigin: "*",
				allow: e => (
					(e.source === bridgeOptions.opener) &&
					(bridgeOptions.openerOrigin !== undefined
						? e.origin === bridgeOptions.openerOrigin
						: true)
				),
			})
			const handshaker = new Messenger<HandshakerFns, {}>({
				conduit: handshakerConduit,
				rpc: async() => ({
					handshake: async port => {
						handshaker.dispose()
						handshakerConduit.dispose()
						const conduit = new PortConduit(port)
						const messenger = new Messenger<PopupFns, OpenerFns>({
							...popupOptions,
							conduit,
							rpc: popupOptions.rpc,
						})
						port.start()
						resolve({messenger, conduit})
					},
				}),
			})
		})
	}

	return {opener, popup}
}

