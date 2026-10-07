
export class HttpError extends Error {
	constructor(public code: number) {
		super(`http error ${code}`)
	}
}

