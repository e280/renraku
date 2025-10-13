
import {AuthFns, Authorize} from "./types.js"

export function authorize<A, S extends AuthFns<A>>(
		service: S,
		getAuth: () => Promise<A>,
	) {

	return new Proxy({}, {

		get: (target: any, key: string) => {
			if (key === "then")
				return undefined

			return target[key] ?? (
				async(...p: any[]) => await service[key](await getAuth(), ...p)
			)
		},

		set: (target: any, key: string, value: any) => {
			target[key] = value
			return true
		},
	}) as Authorize<S>
}

