
import type * as ws from "ws"
import {deadline, ev} from "@e280/stz"

export async function waitForSocketOpen<S extends WebSocket | ws.WebSocket>(
		socket: S,
		timeout: number,
	) {

	if (socket.readyState === 1)
		return socket

	if (socket.readyState > 1)
		throw new Error("socket died")

	const promise = new Promise<S>((resolve, reject) => {
		const detach = ev(socket, {
			open: () => {
				resolve(socket)
				detach()
			},

			close: () => {
				reject()
				detach()
			},

			error: (error: ErrorEvent | ws.ErrorEvent) => {
				reject(error.error)
				detach()
			},
		})
	})

	return deadline(timeout, async() => promise)
}

