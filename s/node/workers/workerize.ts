
import {Fns} from "../../core/base/types.js"
import {Portal} from "../../core/portal/portal.js"
import {nodeAutoTransfer} from "../auto-transfer.js"
import {nodeOfferWorkerPort} from "./utils/offer.js"

export async function nodeWorkerize<ParentFns extends Fns>(workerFns: Fns) {
	const port = await nodeOfferWorkerPort()
	return new Portal<ParentFns>({port, fns: workerFns, autoTransfer: nodeAutoTransfer})
}

