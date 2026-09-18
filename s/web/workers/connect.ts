
import {WorkerConnection} from "./types.js"
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {Portal} from "../../core/portal/portal.js"
import {acceptWorkerPort} from "./utils/accept.js"

export async function connectWorker<WorkerFns extends Fns>(
		url: URL | string,
		parentFns?: Fns,
	): Promise<WorkerConnection<WorkerFns>> {

	const worker = new Worker(url, {type: "module"})

	try {
		const port = await acceptWorkerPort(worker)
		const portal = new Portal<WorkerFns>({port, fns: parentFns, autoTransfer})
		const {remote} = portal
		const dispose = () => {
			portal.close()
			worker.terminate()
		}
		return {remote, dispose}
	}
	catch (error) {
		worker.terminate()
		throw error
	}
}

