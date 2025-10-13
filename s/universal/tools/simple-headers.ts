
import type {IncomingHttpHeaders} from "http"

export type SimpleHeaders = {[K in keyof IncomingHttpHeaders]?: string}

export function simplifyHeader(value: string | string[] | undefined) {
	if (Array.isArray(value)) {
		const [first] = value
		return first || undefined
	}
	else return value
}

export function simplifyHeaders(headers: IncomingHttpHeaders): SimpleHeaders {
	const entries: [string, string][] = []
	for (const [key, value] of Object.entries(headers)) {
		const crushed = simplifyHeader(value)
		if (crushed !== undefined)
			entries.push([key, crushed])
	}
	return Object.fromEntries(entries)
}

