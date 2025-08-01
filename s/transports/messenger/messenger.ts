
import {Trash} from "@e280/stz"

import {defaults} from "../../defaults.js"
import {MessengerOptions} from "./types.js"
import {MessengerMeta} from "./parts/meta.js"
import {JsonRpc} from "../../core/json-rpc.js"
import {bindTap} from "../../core/taps/bind.js"
import {makeRemote} from "../../core/remote.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns} from "../../core/types.js"
import {makeEndpoint} from "../../core/endpoint.js"
import {ResponseWaiter} from "./parts/response-waiter.js"
import {handleIncomingRequests, interpretIncoming, makeRemoteEndpoint} from "./parts/helpers.js"

/**
 * Establish a renraku remote that communicates over the given conduit.
 *  - supports two-way or one-way communication
 *  - you can use a messenger to call a remote messenger
 *  - you can use a messenger to respond to incoming requests
 */
export class Messenger<xRemoteFns extends Fns = any> {
	remote: Remote<xRemoteFns>
	remoteEndpoint: Endpoint

	#waiter: ResponseWaiter
	#trash = new Trash()

	constructor(private options: MessengerOptions<xRemoteFns>) {
		const {conduit, tap} = options

		this.#waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)

		this.remoteEndpoint = makeRemoteEndpoint(
			this.#waiter,
			conduit.sendRequest.pub.bind(conduit.sendRequest),
		)

		this.remote = makeRemote<xRemoteFns>({
			endpoint: this.remoteEndpoint,
			tap: tap && bindTap(tap, {remote: true}),
		})

		this.#trash.add(conduit.recv.sub(m => this.recv(m)))
	}

	async recv(incoming: JsonRpc.Bidirectional) {
		const meta = new MessengerMeta<xRemoteFns>(this.remote)
		const {conduit, rpc, tap} = this.options

		const {requests, responses} = interpretIncoming(incoming)

		for (const response of responses)
			this.#waiter.deliverResponse(response)

		if (!rpc)
			return

		const fns = await rpc(meta)
		const endpoint = makeEndpoint({
			fns,
			tap: tap && bindTap(tap, {remote: false}),
		})

		const outgoing = await handleIncomingRequests(endpoint, requests)
		if (outgoing)
			await conduit.sendResponse(outgoing, meta.transfer)
	}

	dispose() {
		this.#trash.dispose()
	}
}

