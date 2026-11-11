
import {Fns} from "../base/types.js"
import {Connection} from "./connect.js"
import {Messenger} from "../messenger/messenger.js"
import type {ReadyState} from "./utils/ready-state.js"

export type Websockety = {
	readyState: ReadyState
	close(code?: number, reason?: string): void
	send(data: any): void
	onopen: ((...p: any[]) => void) | null
	onerror: ((...p: any[]) => void) | null
	onclose: ((e: any) => void) | null
	onmessage: ((event: any) => void) | null
}

export type AutoTransfer = (x: unknown) => (unknown[] | undefined)

export type PortWiring<RemoteFns extends Fns = any> = {
	port: Port
	messenger: Messenger<RemoteFns>
	remote: RemoteFns

	/** detach the wiring. */
	dispose: () => void

	/** shutdown and dispose all parts. */
	close: () => void
}

export type ConnectionWiring<RemoteFns extends Fns = any> = {
	connection: Connection
	messenger: Messenger<RemoteFns>
	remote: RemoteFns

	/** detach the wiring. */
	dispose: () => void

	/** shutdown and dispose all parts. */
	close: () => void
}

/** agnostic shape compatible with web or node MessagePort */
export type Port = {
	addEventListener(name: string, fn: (event: {origin?: string, data: unknown}) => void): void
	removeEventListener(name: string, fn: (...p: any[]) => void): void
	postMessage(data: unknown, transfer?: unknown[]): void
	start(): void
	close(): void
}

export type Channel = {
	port1: Port
	port2: Port
}

