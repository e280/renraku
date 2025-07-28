
import {Trash} from "@e280/stz"

import {defaults} from "../defaults.js"
import {Fns} from "../../core/types.js"
import {makeRemote} from "../../core/remote.js"
import {MessengerOptions} from "./types.js"
import {JsonRpc} from "../../core/json-rpc.js"
import {Remote} from "../../core/remote-proxy.js"
import {ResponseWaiter} from "./parts/response-waiter.js"
import {handleIncomingRequests, interpretIncoming, makeRemoteEndpoint, Rig} from "./parts/helpers.js"

/**
 * Establish a renraku remote that communicates over the given conduit.
 *  - supports two-way or one-way communication
 *  - you can use a messenger to call a remote messenger
 *  - you can use a messenger to respond to incoming requests
 */
export class Messenger<xRemoteFns extends Fns> {
	remote: Remote<xRemoteFns>
	#waiter: ResponseWaiter
	#trash = new Trash()

	constructor(public options: MessengerOptions<xRemoteFns>) {
		const {conduit} = options

		this.#waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)

		this.remote = makeRemote<xRemoteFns>({
			endpoint: makeRemoteEndpoint(
				this.#waiter,
				conduit.sendRequest.pub.bind(conduit.sendRequest),
			),
			tap: options.tap,
		})

		this.#trash.add(conduit.recv.sub(m => this.recv(m)))
	}

	async recv(incoming: JsonRpc.Bidirectional) {
		const rig = new Rig()
		const {conduit, getLocalEndpoint} = this.options

		const {requests, responses} = interpretIncoming(incoming)

		for (const response of responses)
			this.#waiter.deliverResponse(response)

		if (!getLocalEndpoint)
			return

		const outgoing = await handleIncomingRequests(getLocalEndpoint(this.remote, rig), requests)
		if (outgoing)
			await conduit.sendResponse(outgoing, rig.transfer)
	}

	dispose() {
		this.#trash.dispose()
	}
}

