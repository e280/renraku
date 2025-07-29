
import {ErrorTap} from "./core/taps/error.js"

export const defaults = Object.freeze({
	tap: new ErrorTap(),
	timeout: 60_000,
	maxRequestBytes: 10_000_000,
})

