
import {deadline, defaultTimeout} from "@e280/stz"
import {Worker} from "node:worker_threads"
import {portal} from "../../core/portal/portal.js"
import {nodeAutoTransfer} from "../auto-transfer.js"
import {nodeAcceptWorkerPort} from "./utils/accept.js"
import {Messenger} from "../../core/messenger/messenger.js"

export async function nodeConnectWorker<M extends Messenger>(options: {
		worker: Worker
		messenger: M
		timeout?: number
	}) {

	const {worker, messenger, timeout = defaultTimeout} = options

	try {
		const {remote, port} = portal({
			messenger,
			autoTransfer: nodeAutoTransfer,
			port: await deadline(timeout, nodeAcceptWorkerPort(worker))
		})

		return {
			remote,
			dispose: async() => {
				port.close()
				return worker.terminate()
			},
		}
	}
	catch (error) {
		await worker.terminate()
		throw error
	}
}

