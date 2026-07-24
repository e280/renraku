
import {ExampleFns} from "./types.js"
import {sendPort} from "../ports/send-port.js"
import {Portal} from "../../core/portal/portal.js"
import {webAutoTransfer} from "../web-transferable.js"

const fns: ExampleFns = {
	hello: async() => "world",
}

const {port} = await sendPort({
	topic: "example",
	to: window.parent,
})

new Portal(port, webAutoTransfer, {fns})

