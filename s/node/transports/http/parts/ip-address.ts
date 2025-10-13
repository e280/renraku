
import type {IncomingMessage} from "node:http"
import {simplifyHeader} from "../../../../universal/tools/simple-headers.js"

export function ipAddress(request: IncomingMessage) {
	return (
		simplifyHeader(request.headers["x-forwarded-for"]) ||
		request.socket.remoteAddress ||
		""
	)
}

