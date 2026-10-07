
import {isHappy, isObject} from "@e280/stz"
import {makeAutoTransfer} from "../core/portal/auto-transfer.js"

export const autoTransfer = makeAutoTransfer(
	(x: unknown) => isObject(x) && [
		globalThis.ArrayBuffer,
		globalThis.MessagePort,
		globalThis.ImageBitmap,
		globalThis.OffscreenCanvas,

		globalThis.AudioData,
		globalThis.VideoFrame,
		globalThis.MediaSourceHandle,
		globalThis.MediaStreamTrack,
		globalThis.MIDIAccess,
		globalThis.RTCDataChannel,

		globalThis.ReadableStream,
		globalThis.WritableStream,
		globalThis.TransformStream,
	].filter(isHappy).some(Thing => x instanceof Thing)
)

