
import {MessageLike, MessageReceiver} from "../types.js"

export function onMessage(receiver: MessageReceiver, fn: (e: MessageLike) => void) {
	receiver.addEventListener("message", fn)
	return () => receiver.removeEventListener("message", fn)
}

