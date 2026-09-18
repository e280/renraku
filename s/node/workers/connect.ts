
import {Worker} from "node:worker_threads"
import {Fns} from "../../core/base/types.js"
import {NodeWorkerConnection} from "./types.js"
import {Portal} from "../../core/portal/portal.js"
import {nodeAutoTransfer} from "../auto-transfer.js"
import {nodeAcceptWorkerPort} from "./utils/accept.js"

export async function nodeConnectWorker<WorkerFns extends Fns>(
		url: string,
		parentFns?: Fns,
	): Promise<NodeWorkerConnection<WorkerFns>> {

	const worker = new Worker(url)

	try {
		const port = await nodeAcceptWorkerPort(worker)
		const portal = new Portal<WorkerFns>({port, fns: parentFns, autoTransfer: nodeAutoTransfer})
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

