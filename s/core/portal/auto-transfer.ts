
import {is} from "@e280/stz"

export const noTransfer = () => undefined

export function makeAutoTransfer(shouldTransfer: (x: unknown) => boolean) {
	return (tree: unknown) => auto_transfer_algo(tree, shouldTransfer)
}

function auto_transfer_algo(
		tree: unknown,
		shouldTransfer: (x: unknown) => boolean,
	): Transferable[] {

	const transfers = new Set<Transferable>()
	const seen = new WeakSet<object>()

	function visit(x: unknown) {
		if (!is.object(x)) return
		if (seen.has(x)) return
		seen.add(x)

		if (shouldTransfer(x)) {
			transfers.add(x)
			return
		}

		if (ArrayBuffer.isView(x) && shouldTransfer(x.buffer)) {
			transfers.add(x.buffer as ArrayBuffer)
			return
		}

		if (x instanceof Map) {
			for (const [key, value] of x) {
				visit(key)
				visit(value)
			}
			return
		}

		if (x instanceof Set) {
			for (const value of x)
				visit(value)
			return
		}

		for (const value of Object.values(x))
			visit(value)
	}

	visit(tree)
	return [...transfers]
}

