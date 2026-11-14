
import {isHappy, isObject} from "@e280/stz"
import {isMarkedAsUntransferable, MessagePort} from "node:worker_threads"
import {makeAutoTransfer} from "../core/transport/auto-transfer.js"

export const nodeAutoTransfer = makeAutoTransfer(
	(x: unknown) => isObject(x) && !isMarkedAsUntransferable(x) && [
		globalThis.ArrayBuffer,
		MessagePort,
	].filter(isHappy).some(Thing => x instanceof Thing)
)

