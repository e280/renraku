
import {ExampleFns} from "./types.js"
import {Portal} from "../../core/portal/portal.js"
import {offerWindowPort} from "../windows/offer.js"
import {webAutoTransfer} from "../web-transferable.js"

const fns: ExampleFns = {
	hello: async() => "world",
}

const port = await offerWindowPort({
	topic: "example",
	to: window.parent,
})

new Portal({port, fns, autoTransfer: webAutoTransfer})

