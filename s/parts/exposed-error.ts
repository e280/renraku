
export class ExposedError extends Error {
	name = this.constructor.name

	toString() {
		return `${this.name}: ${this.message}`
	}
}

