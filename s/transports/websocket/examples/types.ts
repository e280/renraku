
export type ExampleServersideFns = {
	now(): Promise<number>
}

export type ExampleClientsideFns = {
	sum(a: number, b: number): Promise<number>
}

