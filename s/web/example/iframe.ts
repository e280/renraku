
import {ExampleFns} from "./types.js"
import {webPortOffer} from "../windows/offer.js"
import {Portal} from "../../core/portal/portal.js"
import {webAutoTransfer} from "../web-transferable.js"

const fns: ExampleFns = {
	hello: async() => "world",
}

const port = await webPortOffer({
	topic: "example",
	to: window.parent,
})

new Portal({port, fns, autoTransfer: webAutoTransfer})

