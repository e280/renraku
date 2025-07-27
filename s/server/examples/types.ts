
export type ExServerside = {
	now(): Promise<number>
}

export type ExClientside = {
	sum(a: number, b: number): Promise<number>
}

