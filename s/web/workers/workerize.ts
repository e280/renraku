
import {deadline, defaultTimeout} from "@e280/stz"
import {autoTransfer} from "../auto-transfer.js"
import {offerWorkerPort} from "./utils/offer.js"
import {portal} from "../../core/portal/portal.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function workerize<M extends Messenger<any>>(
		messenger: M,
		timeout = defaultTimeout
	) {

	return portal({
		messenger,
		autoTransfer,
		port: await deadline(timeout, offerWorkerPort())
	})
}

