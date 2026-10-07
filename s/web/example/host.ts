
import {ExampleFns} from "./types.js"
import {autoTransfer} from "../auto-transfer.js"
import {portal} from "../../core/portal/portal.js"
import {acceptWindowPort} from "../windows/accept.js"
import {Messenger} from "../../core/messenger/messenger.js"

const iframe = document.querySelector<HTMLIFrameElement>("iframe")!

const {remote} = portal({
	autoTransfer,
	messenger: new Messenger<ExampleFns>(),
	port: await acceptWindowPort({
		topic: "example",
		from: iframe.contentWindow!,
		origin: "http://localhost:8080",
	}),
})

console.log(await remote.hello())

