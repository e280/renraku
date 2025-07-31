
import {asFns} from "../types.js"

export type MathFns = {
	add(a: number, b: number): Promise<number>
	mul(a: number, b: number): Promise<number>
}

export function setupMathSpy() {
	const calls = {
		add: [] as {a: number, b: number, ret: number}[],
		mul: [] as {a: number, b: number, ret: number}[],
	}

	const mathFns = asFns<MathFns>({
		async add(a: number, b: number) {
			const ret = a + b
			calls.add.push({a, b, ret})
			return ret
		},
		async mul(a: number, b: number) {
			const ret = a * b
			calls.mul.push({a, b, ret})
			return ret
		},
	})

	return {calls, fns: mathFns}
}

