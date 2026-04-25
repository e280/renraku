
import {ExampleFns} from "./types.js"
import {recvPort} from "../ports/recv-port.js"
import {Portal} from "../../core/portal/portal.js"
import {webAutoTransfer} from "../web-transferable.js"

const iframe = document.querySelector<HTMLIFrameElement>("iframe")!

const port = await recvPort({
	topic: "example",
	from: iframe.contentWindow!,
	fromOrigin: "http://localhost:8080",
})

const portal = new Portal<ExampleFns>(port, webAutoTransfer)

console.log(await portal.remote.hello())

