
import {dig, err, errorString, ok} from "@e280/stz"
import {ExposedError} from "./errors.js"
import {Endpoint, Fn, Fns} from "./types.js"
import {unexposedErrorMessage} from "../consts.js"

export function makeEndpoint(fns: Fns, options: {exposeAllErrors?: boolean} = {}): Endpoint {
	const {exposeAllErrors = false} = options

	return async([path, ...params]) => {
		const fnResult = dig<Fn>(fns, path)

		if (!fnResult.ok)
			return err(`method '${path.join(".")}' ${fnResult.error}`)

		try {
			const fn = fnResult.value
			const value = await fn(...params)
			return ok(value)
		}
		catch (error) {
			return (exposeAllErrors || error instanceof ExposedError)
				? err(errorString(error))
				: err(unexposedErrorMessage)
		}
	}
}

