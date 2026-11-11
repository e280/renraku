
export function processors() {
	return navigator.hardwareConcurrency
}

export function parallelism() {
	return Math.max(1, processors() - 1)
}

