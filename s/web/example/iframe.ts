
import {autoTransfer} from "../auto-transfer.js"
import {makePortal} from "../../core/portal/portal.js"
import {offerWindowPort} from "../windows/offer.js"
import {makeEndpoint} from "../../core/base/endpoint.js"
import {Messenger} from "../../core/messenger/messenger.js"

makePortal({
	autoTransfer,
	port: await offerWindowPort({
		topic: "example",
		to: window.parent,
	}),
	messenger: new Messenger(makeEndpoint({
		hello: async() => "world",
	})),
})

