
import {pipe} from "@e280/stz"
import {IncomingMessage} from "node:http"

export function parse(request: IncomingMessage, maxSize: number) {
	return async() => {
		let size = 0
		const chunks: Uint8Array[] = []

		for await (const chunk of request) {
			size += chunk.length
			if (size > maxSize) throw new Error("max size exceeded")
			chunks.push(chunk)
		}

		return pipe(chunks)
			.to(x => Buffer.concat(x))
			.to(x => x.toString("utf8"))
			.to(x => JSON.parse(x))
			.done()
	}
}

