
import {cycle, deadline, defaultTimeout, defer, ev, Json, nap, pipe, sub} from "@e280/stz"
import {Pingpong} from "./utils/pingpong.js"

const heartbeatInterval = 10_000

export type Connection = Awaited<ReturnType<typeof connect>>

export async function connect<X extends Json = any>(socket: WebSocket, timeout = defaultTimeout) {
	const connect = defer()
	const onRecv = sub<[X]>()
	const onClose = sub<[CloseEvent]>()

	const pingpong = new Pingpong<X>({
		forward: o => onRecv.publish(o),
		send: o => pipe(o)
			.to(o => JSON.stringify(o))
			.to(o => socket.send(o))
			.done(),
	})

	ev(socket, {
		open: () => connect.resolve(),
		error: () => connect.reject(new Error("failed to connect web socket")),
		close: e => onClose.publish(e),
		message: e => pipe(e.data)
			.to(String)
			.to(x => JSON.parse(x))
			.to(x => pingpong.recv(x))
			.done(),
	})

	await deadline(timeout, connect).catch(error => {
		socket.close()
		throw error
	})

	onClose(cycle(async() => {
		await pingpong.ping().catch(() => socket.close())
		await nap(heartbeatInterval)
	}))

	return {
		socket,
		onRecv,
		onClose,
		rtt: pingpong.rtt,
		ping: pingpong.ping,
		send: pingpong.sendData,
		close: () => socket.close(),
	}
}

