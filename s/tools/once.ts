
// TODO replace from stz

export function once<Fn extends (...a: any[]) => any>(fn: Fn) {
	let done = false
	let ret: any

	return ((...a) => {
		if (!done) {
			done = true
			ret = fn(...a)
		}
		return ret
	}) as Fn
}

