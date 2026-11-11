
import {ExampleFns} from "./types.js"
import {autoTransfer} from "../auto-transfer.js"
import {acceptWindowPort} from "../windows/accept.js"
import {wirePort} from "../../core/transport/wire-port.js"
import {Messenger} from "../../core/messenger/messenger.js"

const iframe = document.querySelector<HTMLIFrameElement>("iframe")!

const {remote} = wirePort({
	autoTransfer,
	messenger: new Messenger<ExampleFns>(),
	...await acceptWindowPort({
		topic: "example",
		from: iframe.contentWindow!,
		origin: "http://localhost:8080",
	}),
})

console.log(await remote.hello())

