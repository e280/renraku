
import {cycle, defer, ev, Json, nap, pipe, sub} from "@e280/stz"
import {Pingpong} from "./pingpong.js"

const heartbeatInterval = 10_000

export async function connect<X extends Json = any>(socket: WebSocket) {
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

	await connect

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

