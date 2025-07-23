
// TODO replace from stz

export type EvFn = (...a: any[]) => void

export type EvTarget<N extends string> = {
	addEventListener(name: N, fn: EvFn): void
	removeEventListener(name: N, fn: EvFn): void
}

export function ev<N extends string>(target: EvTarget<N>, fns: Record<N, EvFn>) {
	const entries = Object.entries(fns) as [N, EvFn][]

	for (const [name, fn] of entries)
		target.addEventListener(name, fn)

	return () => {
		for (const [name, fn] of entries)
			target.removeEventListener(name, fn)
	}
}

