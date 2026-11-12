
import {Endpoint} from "./types.js"

export function mirror(endpoints: Endpoint[]): Endpoint {
	if (!endpoints.length)
		throw new Error("mirror needs endpoints")

	return async call => {
		const rets = await Promise.all(endpoints.map(endpoint => endpoint(call)))
		const firstRet = rets[0]
		const firstError = rets.find(ret => !ret.ok)
		return firstError ?? firstRet
	}
}

