
import {availableParallelism} from "node:os"

export function nodeParallelism() {
	const cores = availableParallelism()
	return Math.max(1, cores - 1)
}

