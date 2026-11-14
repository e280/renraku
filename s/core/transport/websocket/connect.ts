
import {disposer, ev, pipe, subby} from "@e280/stz"
import {opened} from "./opened.js"
import {Websockety} from "../types.js"
import {Pingpong} from "../utils/pingpong.js"
import {CloseCode} from "../utils/close-code.js"

export type Connection = Awaited<ReturnType<typeof connect>>

export function connect(websocket: Websockety) {
	const {dispose, schedule} = disposer()
	const onClose = subby(dispose)
	const onRecv = subby<[message: any]>()

	const pingpong = new Pingpong({
		recvData: onRecv.publish,
		send: o => pipe(o)
			.to(o => JSON.stringify(o))
			.to(o => websocket.send(o))
			.done(),
	})

	schedule(pingpong.dispose)

	schedule(ev(websocket, {
		close: onClose.publish,
		message: async e => Promise.resolve(e.data)
			.then(String)
			.then(JSON.parse)
			.then(pingpong.recv)
			.catch(() => {
				pingpong.dispose()
				websocket.close(CloseCode.Error, "bad request")
			}),
	}))

	return {
		onClose: onClose.on,
		onRecv: onRecv.on,

		rtt: pingpong.rtt,
		ping: pingpong.ping,
		send: pingpong.sendData,

		ready: opened(websocket)
			.then(() => schedule(pingpong.heartbeat()))
			.catch(error => {
				dispose()
				throw error
			}),

		close: () => {
			websocket.close(CloseCode.Normal, "bye")
			dispose()
		},
	}
}

