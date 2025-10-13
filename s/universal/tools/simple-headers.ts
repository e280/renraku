
export type SimpleHeaders = Record<string, string | undefined>

export function simplifyHeader(value: string | string[] | undefined) {
	if (Array.isArray(value)) {
		const [first] = value
		return first || undefined
	}
	else return value
}

export function simplifyHeaders(headers: Record<string, string | string[] | undefined>): SimpleHeaders {
	const entries: [string, string][] = []
	for (const [key, value] of Object.entries(headers)) {
		const crushed = simplifyHeader(value)
		if (crushed !== undefined)
			entries.push([key, crushed])
	}
	return Object.fromEntries(entries)
}

