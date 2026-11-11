
import {Fn} from "../types.js"

export function resolveFn(root: unknown, path: string[]): Fn | undefined {
	if (path.length === 0)
		return undefined

	let current: unknown = root

	for (const key of path) {
		if (
			current === null ||
			(typeof current !== "object" && typeof current !== "function")
		) return undefined

		const descriptor = Object.getOwnPropertyDescriptor(current, key)

		if (!descriptor || !("value" in descriptor))
			return undefined

		current = descriptor.value
	}

	return typeof current === "function"
		? current as Fn
		: undefined
}

