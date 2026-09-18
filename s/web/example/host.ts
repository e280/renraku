
import {ExampleFns} from "./types.js"
import {Portal} from "../../core/portal/portal.js"
import {acceptWindowPort} from "../windows/accept.js"
import {autoTransfer} from "../auto-transfer.js"

const iframe = document.querySelector<HTMLIFrameElement>("iframe")!

const port = await acceptWindowPort({
	topic: "example",
	from: iframe.contentWindow!,
	origin: "http://localhost:8080",
})

const portal = new Portal<ExampleFns>({port, autoTransfer: autoTransfer})

console.log(await portal.remote.hello())

