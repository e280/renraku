
import {deadline} from "@e280/stz"
import {Worker} from "node:worker_threads"
import {Fns} from "../../core/base/types.js"
import {NodeWorkerConnection} from "./types.js"
import {Portal} from "../../core/portal/portal.js"
import {nodeAutoTransfer} from "../auto-transfer.js"
import {nodeAcceptWorkerPort} from "./utils/accept.js"

export async function nodeConnectWorker<WorkerFns extends Fns>(options: {

		/** web worker we're connecting to. */
		worker: Worker

		/** local parent functions that the worker can call. */
		fns?: Fns

		/** how long we're willing to wait before an error is thrown. */
		timeout?: number

		/** timeout override for specifically the connection process (defaults to 'timeout'). */
		connectTimeout?: number

		/** let the worker read error details when our functions throw (default false). */
		exposeAllErrors?: boolean

	}): Promise<NodeWorkerConnection<WorkerFns>> {

	const {worker, fns, timeout, connectTimeout = timeout, exposeAllErrors} = options

	try {
		const port = await deadline(connectTimeout, nodeAcceptWorkerPort(worker))
		const portal = new Portal<WorkerFns>({
			fns,
			port,
			timeout,
			exposeAllErrors,
			autoTransfer: nodeAutoTransfer,
		})
		const {remote} = portal
		const dispose = async() => {
			portal.close()
			return worker.terminate()
		}
		return {remote, dispose}
	}
	catch (error) {
		await worker.terminate()
		throw error
	}
}

