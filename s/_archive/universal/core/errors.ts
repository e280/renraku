
/**
 * An error that has a publicly viewable name and message.
 *  - this error class, and its subclasses, are the only kinds of errors that renraku will send back to clients
 *  - so if you want a client to be able to read an error message you throw, it must be a subclass of ExposedError
 */
export class ExposedError extends Error {
	readonly name = this.constructor.name
}

////////////////////////////////////////////////////

export class RemoteError extends Error {
	readonly name = this.constructor.name
}

export class RemoteTimeoutError extends RemoteError {
	readonly name = this.constructor.name
}

////////////////////////////////////////////////////

export class HttpError extends Error {
	readonly name = this.constructor.name
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

