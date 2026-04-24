
export type AutoTransfer = (x: unknown) => (unknown[] | undefined)

/** agnostic shape compatible with web or node MessagePort */
export type Port = {
	addEventListener(name: string, fn: (event: {origin?: string, data: any}) => void): void
	postMessage(data: any, transfer?: any[]): void
	start(): void
	close(): void
}

