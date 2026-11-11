
import {err, errorString, ok} from "@e280/stz"
import {ExposedError} from "./errors.js"
import {Endpoint, Fns} from "./types.js"
import {resolveFn} from "./utils/resolve-fn.js"
import {unexposedErrorMessage} from "../../consts.js"

export function makeEndpoint<F extends Fns>(
		fns: F,
		options: {exposeAllErrors?: boolean} = {},
	): Endpoint {

	const {exposeAllErrors = false} = options

	return async([path, ...params]) => {
		try {
			const fn = resolveFn(fns, path)

			if (!fn)
				return err(`method '${path.join(".")}' not found`)

			return ok(await fn(...params))
		}
		catch (error) {
			return (exposeAllErrors || error instanceof ExposedError)
				? err(errorString(error))
				: err(unexposedErrorMessage)
		}
	}
}

