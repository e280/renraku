
import {is} from "@e280/stz"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const webAutoTransfer = makeAutoTransfer(
	(x: unknown) => is.object(x) && [
		window.ArrayBuffer,
		window.MessagePort,
		window.ImageBitmap,
		window.OffscreenCanvas,

		window.AudioData,
		window.VideoFrame,
		window.MediaSourceHandle,
		window.MediaStreamTrack,
		window.MIDIAccess,
		window.RTCDataChannel,

		window.ReadableStream,
		window.WritableStream,
		window.TransformStream,
	].filter(is.happy).some(Thing => x instanceof Thing)
)

