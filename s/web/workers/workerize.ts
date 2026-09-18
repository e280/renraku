
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {offerWorkerPort} from "./utils/offer.js"
import {Portal} from "../../core/portal/portal.js"

export async function workerize<ParentFns extends Fns>(workerFns: Fns) {
	const port = await offerWorkerPort()
	return new Portal<ParentFns>({port, fns: workerFns, autoTransfer})
}

