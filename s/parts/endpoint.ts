
import {dig, err, ok} from "@e280/stz"
import {Endpoint, Fn, Fns} from "./types.js"
import {ExposedError} from "./exposed-error.js"

export function makeEndpoint(fns: Fns): Endpoint {
	return async([method, params]) => {
		const fnResult = dig<Fn>(fns, method)

		if (!fnResult.ok)
			return err("not found")

		try {
			const fn = fnResult.value
			const value = await fn(...params)
			return ok(value)
		}
		catch (error) {
			return (error instanceof ExposedError)
				? err(error.toString())
				: err("error")
		}
	}
}

