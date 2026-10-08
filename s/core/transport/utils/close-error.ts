
export class CloseError extends Error {
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

