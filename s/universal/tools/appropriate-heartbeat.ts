
const coefficient = 2 / 3
const fallback = 60_000

export function appropriateHeartbeat(timeout: number) {
	return coefficient * (
		timeout === Infinity
			? fallback
			: timeout
	)
}

