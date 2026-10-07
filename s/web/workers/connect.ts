
import {deadline, defaultTimeout} from "@e280/stz"
import {autoTransfer} from "../auto-transfer.js"
import {portal} from "../../core/portal/portal.js"
import {acceptWorkerPort} from "./utils/accept.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function connectWorker<M extends Messenger<any>>(options: {
		worker: Worker
		messenger: M
		timeout?: number
	}) {

	const {worker, messenger, timeout = defaultTimeout} = options

	try {
		const {port, remote} = portal({
			messenger,
			autoTransfer,
			port: await deadline(timeout, acceptWorkerPort(worker)),
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

