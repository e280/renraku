
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

