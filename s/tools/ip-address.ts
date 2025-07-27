
import type {IncomingMessage} from "http"
import {simplifyHeader} from "./simple-headers.js"

export function ipAddress(request: IncomingMessage) {
	return (
		simplifyHeader(request.headers["x-forwarded-for"]) ||
		request.socket.remoteAddress ||
		""
	)
}

