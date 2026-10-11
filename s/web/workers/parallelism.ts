
export function parallelism() {
	const cores = navigator.hardwareConcurrency ?? 1
	return Math.max(1, cores - 1)
}

