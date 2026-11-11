
import {availableParallelism} from "node:os"

export function nodeProcessors() {
	return availableParallelism()
}

export function nodeParallelism() {
	return Math.max(1, nodeProcessors() - 1)
}

