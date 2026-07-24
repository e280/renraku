
import {is} from "@e280/stz"
import {MessagePort} from "node:worker_threads"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const nodeAutoTransfer = makeAutoTransfer(
	(x: unknown) => is.object(x) && [
		globalThis.ArrayBuffer,
		MessagePort,
	].filter(is.happy).some(Thing => x instanceof Thing)
)

