
import {ExampleFns} from "./types.js"
import {webPortAccept} from "../windows/accept.js"
import {Portal} from "../../core/portal/portal.js"
import {webAutoTransfer} from "../web-transferable.js"

const iframe = document.querySelector<HTMLIFrameElement>("iframe")!

const port = await webPortAccept({
	topic: "example",
	from: iframe.contentWindow!,
	origin: "http://localhost:8080",
})

const portal = new Portal<ExampleFns>({port, autoTransfer: webAutoTransfer})

console.log(await portal.remote.hello())

