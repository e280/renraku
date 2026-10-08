
import * as ws from "ws"
import {cycle, defer, disposer, Json, nap, once, pipe} from "@e280/stz"
import {Pingpong} from "./utils/pingpong.js"
import {heartbeatInterval, maxSocketBacklog} from "../../consts.js"

enum Readystate {
	Connecting = 0,
	Open = 1,
	Closing = 2,
	Closed = 3,
}

enum Closecode {
	Normal = 1000,
	Error = 4001,
}

export type Sock = {
	close(code?: number, reason?: string): void
	readyState: Readystate
	send(data: any): void
	onopen: ((...p: any[]) => void) | null
	onerror: ((...p: any[]) => void) | null
	onclose: ((e: any) => void) | null
	onmessage: ((event: any) => void) | null
}

type JsockParams = {
	close: (code?: number, reason?: string) => void
	send: (data: Json) => void
}

type JsockHandlers = {
	recv: (data: Json) => (void | Promise<void>)
	errored: () => void
	closed: () => void
}

type JsockFn = (params: JsockParams) => Promise<JsockHandlers>

export class SockCloseError extends Error {
	static fromEvent(e: any) {
		return new this(e.code, e.reason, e.wasClean)
	}

	constructor(
			readonly code: number,
			readonly reason: string,
			readonly wasClean: boolean,
		) {
		super(`web socket closed ${wasClean ? "cleanly" : "dirty"}, code ${code}, reason ${reason}`)
	}
}

export async function jsock(sock: Sock, fn: JsockFn) {
	const opened = defer()
	const backlog: Json[] = []
	const dispose = disposer()
	const d = dispose.schedule

	const kill = once((code = Closecode.Normal, reason = "bye") => {
		dispose()
		sock.close(code, reason)
	})

	let recv: (m: Json) => (void | Promise<void>) = m => {
		backlog.push(m)
		if (backlog.length > maxSocketBacklog)
			kill(Closecode.Error, "too many messages before setup")
	}

	const pingpong = new Pingpong({
		forward: o => recv(o),
		send: o => pipe(o)
			.to(o => JSON.stringify(o))
			.to(o => sock.send(o))
			.done(),
	})

	d(() => pingpong.dispose())

	sock.onopen = opened.resolve
	sock.onerror = () => opened.reject(new Error("connection error"))
	sock.onclose = e => opened.reject(SockCloseError.fromEvent(e))
	sock.onmessage = async e => Promise.resolve(e.data)
		.then(String)
		.then(JSON.parse)
		.then(pingpong.recv)
		.catch(() => kill(Closecode.Error, "bad request"))

	switch (sock.readyState) {
		case Readystate.Connecting: break
		case Readystate.Open: opened.resolve(); break
		default: opened.reject(new Error("closed before open"))
	}

	await opened.catch(error => {
		dispose()
		throw error
	})

	const handlers = await fn({
		close: kill,
		send: pingpong.sendData,
	}).catch(error => {
		kill()
		throw error
	})

	if (sock.readyState !== Readystate.Open)
		return dispose()

	recv = handlers.recv

	try {
		void Promise.all(backlog.map(m => recv(m)))
			.catch(() => kill())
	}
	catch {
		return kill(Closecode.Error, "bad request")
	}

	sock.onerror = () => {
		dispose()
		handlers.errored()
	}

	sock.onclose = () => {
		dispose()
		handlers.closed()
	}

	d(cycle(async() => {
		await pingpong.ping().catch(kill)
		await nap(heartbeatInterval)
	}))
}

// type compat checks
jsock3({} as WebSocket, {} as any)
jsock3({} as ws.WebSocket, {} as any)

