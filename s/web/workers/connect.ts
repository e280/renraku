
import {deadline} from "@e280/stz"
import {WorkerConnection} from "./types.js"
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {Portal} from "../../core/portal/portal.js"
import {acceptWorkerPort} from "./utils/accept.js"

export async function connectWorker<WorkerFns extends Fns>(options: {

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

	}): Promise<WorkerConnection<WorkerFns>> {

	const {worker, fns, timeout, connectTimeout = timeout, exposeAllErrors} = options

	try {
		const portal = new Portal<WorkerFns>({
			fns,
			timeout,
			autoTransfer,
			exposeAllErrors,
			port: await deadline(connectTimeout, acceptWorkerPort(worker)),
		})

		return {
			remote: portal.remote,
			dispose: () => {
				portal.close()
				worker.terminate()
			},
		}
	}
	catch (error) {
		worker.terminate()
		throw error
	}
}

