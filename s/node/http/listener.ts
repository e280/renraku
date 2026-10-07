
import type {RequestListener} from "node:http"

import {parse} from "./utils/parse.js"
import {error} from "./utils/error.js"
import {sendError} from "./utils/send-error.js"
import {sendResult} from "./utils/send-result.js"
import {defaultMaxRequestSize} from "../../consts.js"
import type {Endpoint} from "../../core/base/types.js"

export function httpListener(
		endpoint: Endpoint,
		options: {maxRequestSize?: number} = {},
	): RequestListener {

	const {maxRequestSize = defaultMaxRequestSize} = options

	return async(request, response) => {
		return Promise.resolve()
			.then(parse(request, maxRequestSize))
			.then(endpoint, error(400))
			.then(sendResult(response), error(500))
			.catch(sendError(response))
	}
}

