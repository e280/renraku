
import {dig, err, ok} from "@e280/stz"
import {ExposedError} from "./errors.js"
import {Endpoint, Fn, Fns} from "./types.js"

export function makeEndpoint(fns: Fns): Endpoint {
	return async([path, ...params]) => {
		const fnResult = dig<Fn>(fns, path)

		if (!fnResult.ok)
			return err("not found")

		try {
			const fn = fnResult.value
			const value = await fn(...params)
			return ok(value)
		}
		catch (error) {
			return (error instanceof ExposedError)
				? err(error.message)
				: err("error")
		}
	}
}

