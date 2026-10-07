
import {defaultTimeout, defer, Deferred, err, errorString, nap, sub} from "@e280/stz"
import {makeRemote} from "../base/remote.js"
import {makeEndpoint} from "../base/endpoint.js"
import {Endpoint, Fns, Ret} from "../base/types.js"
import {Request, Message, MessageKind, Response} from "./types.js"

/** bidirectional messenger */
export class Messenger<RemoteFns extends Fns = any> {
	#id = 0
	#timeout
	#endpoint
	#pending = new Map<number, Deferred<Ret>>()

	readonly onSend = sub<[Message]>()

	constructor(endpoint?: Endpoint, timeout = defaultTimeout) {
		this.#endpoint = endpoint ?? makeEndpoint({})
		this.#timeout = timeout
	}

	readonly remote = makeRemote<RemoteFns>(async call => {
		const id = this.#id++
		const deferred = defer<Ret>()
		this.#pending.set(id, deferred)
		const timeout = this.#timeout ?? defaultTimeout
		if (timeout !== Infinity)
			nap(timeout).then(() => {
				const deferred = this.#pending.get(id)
				if (deferred) {
					this.#pending.delete(id)
					deferred.resolve(err("timed out"))
				}
			})
		try {
			this.onSend.publish([MessageKind.Request, id, call])
		}
		catch (error) {
			this.#pending.delete(id)
			deferred.resolve(err(errorString(error, "send failed")))
		}
		return deferred.promise
	})

	readonly recv = async(msg: Message) => {
		switch (msg[0]) {
			case MessageKind.Request: return this.#recvCall(msg)
			case MessageKind.Response: return this.#recvRet(msg)
		}
	}

	async #recvCall([, id, call]: Request) {
		const ret = await this.#endpoint(call)
		this.onSend.publish([MessageKind.Response, id, ret])
	}

	async #recvRet([, id, ret]: Response) {
		const pending = this.#pending.get(id)
		if (pending) {
			this.#pending.delete(id)
			pending.resolve(ret)
		}
	}
}

