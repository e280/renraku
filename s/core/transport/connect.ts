
import {cycle, defer, disposer, Json, nap, once, pipe, sub} from "@e280/stz"
import {Websockety} from "./types.js"
import {Pingpong} from "./utils/pingpong.js"
import {CloseCode} from "./utils/close-code.js"
import {CloseError} from "./utils/close-error.js"
import {ReadyState} from "./utils/ready-state.js"
import {heartbeatInterval, maxSocketBacklog} from "../../consts.js"

export type Connection = Awaited<ReturnType<typeof connect>>

export async function connect(websocket: Websockety) {
	const opened = defer()
	const backlog: Json[] = []
	const dispose = disposer()
	const d = dispose.schedule

	const onRecv = sub<[message: any]>()
	const onClose = sub()

	d(() => onRecv.clear())

	const kill = once((code = CloseCode.Normal, reason = "bye") => {
		dispose()
		websocket.close(code, reason)
	})

	let recv: (m: Json) => (void | Promise<void>) = m => {
		backlog.push(m)
		if (backlog.length > maxSocketBacklog)
			kill(CloseCode.Error, "too many messages before setup")
	}

	const pingpong = new Pingpong({
		forward: o => recv(o),
		send: o => pipe(o)
			.to(o => JSON.stringify(o))
			.to(o => websocket.send(o))
			.done(),
	})

	d(() => pingpong.dispose())

	websocket.onopen = opened.resolve
	websocket.onerror = () => opened.reject(new Error("connection error"))
	websocket.onclose = e => opened.reject(CloseError.fromEvent(e))
	websocket.onmessage = async e => Promise.resolve(e.data)
		.then(String)
		.then(JSON.parse)
		.then(pingpong.recv)
		.catch(() => kill(CloseCode.Error, "bad request"))

	switch (websocket.readyState) {
		case ReadyState.Connecting: break
		case ReadyState.Open: opened.resolve(); break
		default: opened.reject(new Error("closed before open"))
	}

	await opened.catch(error => {
		dispose()
		throw error
	})

	websocket.onclose = websocket.onerror = () => {
		dispose()
		onClose.publish()
	}

	d(cycle(async() => {
		await pingpong.ping().catch(() => {})
		await nap(heartbeatInterval)
	}))

	const registerFirstReciever = once((fn: (data: any) => void) => {
		// stop backlogging
		recv = o => pingpong.recv(o as any)

		// flush backlog
		for (const m of backlog)
			void Promise.resolve()
				.then(() => fn(m))
				.catch(() => {})
	})

	return {
		send: pingpong.sendData,
		close: () => kill(),

		rtt: pingpong.rtt,
		ping: pingpong.ping,

		onClose,
		onRecv: (fn: (data: any) => void) => {
			const unsub = onRecv(fn)
			registerFirstReciever(fn)
			return unsub
		},
	}
}

