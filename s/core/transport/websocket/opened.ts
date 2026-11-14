
import {defer, ev} from "@e280/stz"
import {Websockety} from "../types.js"
import {CloseError} from "../utils/close-error.js"
import {ReadyState} from "../utils/ready-state.js"

export async function opened(websocket: Websockety) {
	const deferred = defer()

	const dispose = ev(websocket, {
		open: deferred.resolve,
		error: () => deferred.reject(new Error("connection error")),
		close: e => deferred.reject(CloseError.fromEvent(e)),
	})

	switch (websocket.readyState) {
		case ReadyState.Connecting: break
		case ReadyState.Open: deferred.resolve(); break
		default: deferred.reject(new Error("closed before open"))
	}

	await deferred.finally(dispose)
}

