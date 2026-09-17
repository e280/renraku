
import {is} from "@e280/stz"

export type WebAcceptOptions = {
	topic: string
	from: Window | WindowProxy
	origin: string
	allow?: (event: MessageEvent) => boolean
}

export type Topical<P> = {topic: string, payload: P}

export const goodTopic = <P>(data: any, topic: string): data is Topical<P> => (
	is.object(data)
	&& is.string(data.topic)
	&& data.topic === topic
)

export function assert(x: any, err: string) {
	if (!x) throw new Error(err)
	else return x
}

