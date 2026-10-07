
import {deadline, defaultTimeout} from "@e280/stz"
import {portal} from "../../core/portal/portal.js"
import {nodeAutoTransfer} from "../auto-transfer.js"
import {nodeOfferWorkerPort} from "./utils/offer.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function nodeWorkerize<M extends Messenger>(
		messenger: M,
		timeout = defaultTimeout,
	) {

	return portal({
		messenger,
		autoTransfer: nodeAutoTransfer,
		port: await deadline(timeout, nodeOfferWorkerPort()),
	})
}

