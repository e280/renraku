
import * as ws from "ws"
import {cycle, defer, Json, nap, pipe, sub} from "@e280/stz"
import {Pingpong} from "./utils/pingpong.js"
import {heartbeatInterval} from "../../consts.js"

enum Readystate {
	Connecting = 0,
	Open = 1,
	Closing = 2,
	Closed = 3,
}

export type Sock = {
	close(): void
	readyState: Readystate
	send(data: string): void
	onopen: ((...p: any[]) => void) | null
	onclose: ((...p: any[]) => void) | null
	onerror: ((...p: any[]) => void) | null
	onmessage: ((event: any) => void) | null
}

export async function jsock(sock: Sock) {
	const opened = defer()
	let recv = (_json: any) => {}

	const pingpong = new Pingpong({
		forward: o => recv(o),
		send: o => pipe(o)
			.to(o => JSON.stringify(o))
			.to(o => sock.send(o))
			.done(),
	})

	sock.onopen = opened.resolve
	sock.onerror = () => opened.reject(new Error("connection error"))
	sock.onclose = () => opened.reject(new Error("connection closed"))
	sock.onmessage = e => pipe(e.data)
		.to(String)
		.to(JSON.parse)
		.to(pingpong.recv)
		.done()

	switch (sock.readyState) {
		case Readystate.Connecting: break
		case Readystate.Open: opened.resolve(); break
		default: opened.reject(new Error("closed before open"))
	}

	await opened

	const close = () => {
		sock.close()
		stopHeartbeat()
		pingpong.dispose()
	}

	const onRecv = sub<[Json]>()
	const onError = sub()
	const onClose = sub()

	recv = onRecv.publish
	sock.onerror = onError.publish
	sock.onclose = onClose.publish

	const stopHeartbeat = cycle(async() => {
		await pingpong.ping().catch(close)
		await nap(heartbeatInterval)
	})

	return {
		onRecv,
		onError,
		onClose,
		send: pingpong.sendData,
		close,
	}
}

// type compat checks
jsock({} as WebSocket)
jsock({} as ws.WebSocket)

