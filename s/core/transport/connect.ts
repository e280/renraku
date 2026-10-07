
import {cycle, defer, ev, Json, nap, pipe, sub} from "@e280/stz"
import {Pingpong} from "./pingpong.js"

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

	return {
		socket,
		onRecv,
		onClose,
		rtt: pingpong.rtt,
		ping: pingpong.ping,
		send: pingpong.sendData,
		close: () => socket.close(),
		startHeartbeat(interval: number, fn?: (rtt: number) => void) {
			const stop = cycle(async() => {
				await nap(interval)
				try {
					const rtt = await pingpong.ping()
					fn?.(rtt)
				}
				catch {
					socket.close()
					stop()
				}
			})
			onClose(stop)
			return stop
		},
	}
}

