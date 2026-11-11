
import {isObject, isString} from "@e280/stz"
import {Topical} from "./types.js"

export function check(options: {
		event: MessageEvent
		topic: string
		origin: string
		source: Window | WindowProxy
	}) {

	const {event} = options

	return (
		isGoodTopic(event.data, options.topic) &&
		assert(event.source === options.source, "bad message source") &&
		(
			options.origin === "*" ||
			assert(event.origin === options.origin, `bad message origin "${event.origin}"`)
		)
	)
}

const isGoodTopic = <P>(data: any, topic: string): data is Topical<P> => (
	isObject(data)
	&& isString(data.topic)
	&& data.topic === topic
)

const assert = (x: any, failure: string) => {
	if (x) return true
	else {
		console.warn(failure)
		return false
	}
}

