
import {isHappy, isObject} from "@e280/stz"
import {MessagePort} from "node:worker_threads"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const nodeAutoTransfer = makeAutoTransfer(
	(x: unknown) => isObject(x) && [
		globalThis.ArrayBuffer,
		MessagePort,
	].filter(isHappy).some(Thing => x instanceof Thing)
)

