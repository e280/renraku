
import {ExampleFns} from "./types.js"
import {Portal} from "../../core/portal/portal.js"
import {offerWindowPort} from "../windows/offer.js"
import {autoTransfer} from "../auto-transfer.js"

const fns: ExampleFns = {
	hello: async() => "world",
}

const port = await offerWindowPort({
	topic: "example",
	to: window.parent,
})

new Portal({port, fns, autoTransfer: autoTransfer})

