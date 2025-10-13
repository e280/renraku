
import {disposer} from "@e280/stz"

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
export class Messenger<LocalFns extends Fns = any, RemoteFns extends Fns = any> {
	remote: Remote<RemoteFns>
	remoteEndpoint: Endpoint
	#waiter: ResponseWaiter

	/** dispose this messenger (not the conduit inside) */
	dispose = disposer()

	constructor(private options: MessengerOptions<LocalFns, RemoteFns>) {
		const {conduit, tap} = options

		this.#waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)

		this.remoteEndpoint = makeRemoteEndpoint(
			this.#waiter,
			conduit.sendRequest.pub.bind(conduit.sendRequest),
		)

		this.remote = makeRemote<RemoteFns>({
			endpoint: this.remoteEndpoint,
			tap: tap && bindTap(tap, {remote: true}),
		})

		this.dispose.schedule(conduit.recv.sub(m => this.recv(m)))
	}

	get conduit() {
		return this.options.conduit
	}

	async recv(incoming: JsonRpc.Bidirectional) {
		const meta = new MessengerMeta<RemoteFns>(this.remote)
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
}

