
export class Averager {
	#memory: number[] = []
	#average: number = 0
	#latest: number = 0

	constructor(public size: number) {}

	get average() { return this.#average }
	get latest() { return this.#latest }

	add(n: number) {
		this.#latest = n
		const memory = this.#memory

		memory.push(n)

		while (memory.length > this.size)
			memory.shift()

		if (memory.length > 0) {
			const sum = memory.reduce((p, c) => p + c, 0)
			this.#average = sum / memory.length
		}

		return this.#average
	}
}

