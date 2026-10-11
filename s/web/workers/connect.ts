
import {deadline, defaultTimeout} from "@e280/stz"
import {acceptWorkerPort} from "./accept.js"
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {makePortal} from "../../core/portal/portal.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function connectWorker<RemoteFns extends Fns>(options: {
		worker: Worker
		messenger: Messenger<RemoteFns>
		timeout?: number
	}) {

	const {worker, messenger, timeout = defaultTimeout} = options

	try {
		const {port, remote} = makePortal({
			messenger,
			autoTransfer,
			port: await deadline(timeout, acceptWorkerPort(worker))
				.catch(error => {
					worker.terminate()
					throw error
				}),
		})

		return {
			remote,
			messenger,
			dispose: () => {
				port.close()
				worker.terminate()
			},
		}
	}
	catch (error) {
		worker.terminate()
		throw error
	}
}

