
import {is} from "@e280/stz"
import {Conduit} from "./conduit/conduit.js"
import {autoTransfer} from "./conduit/auto-transfer.js"

// example demo
const popup = {} as Window

const fns = {
	async add(x: number, y: number) {
		return x + y
	},
}

const conduit = new Conduit({
	fns,
	send: msg => popup.postMessage(
		{kind: "rpc", msg},
		popup.origin,
		autoTransfer(msg),
	)
})

window.addEventListener("message", event => {
	if (event.origin === popup.origin && is.object(event.data) && event.data.kind === "rpc") {
		conduit.recv(event.data.msg)
	}
})

