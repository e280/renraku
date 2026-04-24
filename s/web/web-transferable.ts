
import {is} from "@e280/stz"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const webAutoTransfer = makeAutoTransfer(
	(x: unknown) => is.object(x) && [
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
)

