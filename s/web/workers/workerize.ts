
import {deadline, defaultTimeout} from "@e280/stz"
import {offerWorkerPort} from "./offer.js"
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {makePortal} from "../../core/portal/portal.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function workerize<RemoteFns extends Fns>(
		messenger: Messenger<RemoteFns>,
		timeout = defaultTimeout
	) {

	return makePortal({
		messenger,
		autoTransfer,
		port: await deadline(timeout, offerWorkerPort())
	})
}

