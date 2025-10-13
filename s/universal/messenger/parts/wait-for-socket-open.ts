
import {deadline, ev} from "@e280/stz"
import {UniWebSocket} from "../types.js"

export async function waitForSocketOpen<S extends UniWebSocket>(
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

			error: (error: {error: any}) => {
				reject(error.error)
				detach()
			},
		})
	})

	return deadline(timeout, async() => promise)
}

