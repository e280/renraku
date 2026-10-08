
export type AutoTransfer = (x: unknown) => (unknown[] | undefined)

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

