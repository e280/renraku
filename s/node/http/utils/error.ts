
import {HttpError} from "./http-error.js"

export const error = (code: number) => (error: unknown) => {
	throw (error instanceof HttpError)
		? error
		: new HttpError(code)
}

