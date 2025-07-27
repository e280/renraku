
import {defer} from "@e280/stz"
import {Endpoint} from "../../../core/types.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {Channel, ChannelMessage} from "../types.js"
import {ResponseWaiter} from "./response-waiter.js"

export class Rig {
	transfer: Transferable[] | undefined = undefined
}

export function onMessage(channel: Channel, fn: (e: ChannelMessage) => void) {
	channel.addEventListener("message", fn)
	return () => channel.removeEventListener("message", fn)
}

////////////////

export type SendRequestFn = (
	request: JsonRpc.Request,
	transfer: Transferable[] | undefined,
	done: Promise<JsonRpc.Response | null>,
) => void

export function makeRemoteEndpoint(waiter: ResponseWaiter, sendRequest: SendRequestFn): Endpoint {
	return async(request, {transfer} = {}) => {
		if ("id" in request) {
			const done = defer<JsonRpc.Response | null>()
			sendRequest(request, transfer, done.promise)
			return waiter.wait(request.id, request.method).then(response => {
				done.resolve(response)
				return response
			})
		}
		else {
			const done = Promise.resolve(null)
			sendRequest(request, transfer, done)
			return done
		}
	}
}

export function interpretIncoming(json: JsonRpc.Bidirectional) {
	const requests: JsonRpc.Request[] = []
	const responses: JsonRpc.Response[] = []

	for (const item of (Array.isArray(json) ? json : [json])) {
		if ("method" in item) requests.push(item)
		else responses.push(item)
	}

	return {requests, responses}
}

export async function handleIncomingRequests(
		localEndpoint: Endpoint,
		requests: JsonRpc.Request[],
	): Promise<JsonRpc.Respondish | null> {

	const responses = (
		await Promise.all(
			requests.map(async request => localEndpoint(request))
		)
	).filter(r => r !== null)

	if (responses.length === 0)
		return null

	return (responses.length === 1)
		? responses[0]
		: responses
}

export function handleIncomingResponses(
		waiter: ResponseWaiter,
		responses: JsonRpc.Response[],
	) {

	for (const response of responses)
		waiter.deliverResponse(response)
}

