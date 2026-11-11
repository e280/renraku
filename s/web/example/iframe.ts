
import {autoTransfer} from "../auto-transfer.js"
import {offerWindowPort} from "../windows/offer.js"
import {makePortal} from "../../core/portal/portal.js"
import {makeEndpoint} from "../../core/base/endpoint.js"
import {Messenger} from "../../core/messenger/messenger.js"

makePortal({
	autoTransfer,
	messenger: new Messenger(makeEndpoint({hello: async() => "world"})),
	...await offerWindowPort({to: window.parent, topic: "example"}),
})

