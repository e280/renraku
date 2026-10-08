
import {deadline, defaultTimeout} from "@e280/stz"
import {autoTransfer} from "../auto-transfer.js"
import {offerWorkerPort} from "./offer.js"
import {makePortal} from "../../core/portal/portal.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function workerize<M extends Messenger<any>>(
		messenger: M,
		timeout = defaultTimeout
	) {

	return makePortal({
		messenger,
		autoTransfer,
		port: await deadline(timeout, offerWorkerPort())
	})
}

