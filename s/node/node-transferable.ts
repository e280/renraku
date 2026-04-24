
import {is} from "@e280/stz"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const nodeAutoTransfer = makeAutoTransfer(
	(x: unknown) => is.object(x) && [
		ArrayBuffer,
		MessagePort,
	].some(Thing => x instanceof Thing)
)

