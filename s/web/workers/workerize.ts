
import {deadline} from "@e280/stz"
import {Fns} from "../../core/base/types.js"
import {autoTransfer} from "../auto-transfer.js"
import {offerWorkerPort} from "./utils/offer.js"
import {Portal} from "../../core/portal/portal.js"

export async function workerize<ParentFns extends Fns>(options: {

		/** local worker functions that the parent can call. */
		fns?: Fns

		/** how long we're willing to wait before an error is thrown. */
		timeout?: number

		/** timeout override for specifically the connection process (defaults to 'timeout'). */
		connectTimeout?: number

		/** let the parent read error details when our functions throw (default false). */
		exposeAllErrors?: boolean

	} = {}) {

	const {fns, timeout, connectTimeout = timeout, exposeAllErrors} = options

	const port = await deadline(connectTimeout, offerWorkerPort())

	return new Portal<ParentFns>({port, fns, timeout, autoTransfer, exposeAllErrors})
}

