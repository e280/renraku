
import {dig, err, ok} from "@e280/stz"
import {Endpoint, Fn, Fns} from "./types.js"

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
			return err("error")
		}
	}
}

