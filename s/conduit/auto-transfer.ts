
import {is} from "@e280/stz"

export const isBrowserTransferable = (x: unknown) => {
	return is.object(x) && [
		ArrayBuffer,
		MessagePort,
		ImageBitmap,
		OffscreenCanvas,

		AudioData,
		VideoFrame,
		MediaSourceHandle,
		MediaStreamTrack,
		MIDIAccess,
		RTCDataChannel,

		ReadableStream,
		WritableStream,
		TransformStream,
	].some(Thing => x instanceof Thing)
}

export const isNodeTransferable = (x: unknown) => {
	return is.object(x) && [
		ArrayBuffer,
		MessagePort,
	].some(Thing => x instanceof Thing)
}


export function autoTransfer(
		tree: unknown,
		shouldTransfer = isBrowserTransferable,
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

