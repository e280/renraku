
import {autoTransfer} from "../auto-transfer.js"
import {offerWindowPort} from "../windows/offer.js"
import {makeEndpoint} from "../../core/base/endpoint.js"
import {wirePort} from "../../core/transport/wire-port.js"
import {Messenger} from "../../core/messenger/messenger.js"

wirePort({
	autoTransfer,
	messenger: new Messenger(makeEndpoint({hello: async() => "world"})),
	...await offerWindowPort({
		to: window.parent,
		topic: "example",
		origin: "*",
	}),
})

