
import {defaultTimeout, defer, Deferred, err, errorString, subby} from "@e280/stz"
import {makeRemote} from "../base/remote.js"
import {makeEndpoint} from "../base/endpoint.js"
import {Endpoint, Fns, Ret} from "../base/types.js"
import {Request, Message, MessageKind, Response} from "./types.js"

/** bidirectional messenger */
export class Messenger<RemoteFns extends Fns = any> {
	#id = 0
	#timeout
	#localEndpoint
	#onSend = subby<[Message]>()
	#pending = new Map<number, {timer: any, deferred: Deferred<Ret>}>()
	#disposed = false

	constructor(localEndpoint?: Endpoint, timeout = defaultTimeout) {
		this.#localEndpoint = localEndpoint ?? makeEndpoint({})
		this.#timeout = timeout
	}

	readonly remoteEndpoint: Endpoint = async call => {
		if (this.#disposed) return err("messenger disposed")
		const id = this.#id++
		const deferred = defer<Ret>()
		const pend = {timer: <any>undefined, deferred}
		this.#pending.set(id, pend)
		const timeout = this.#timeout ?? defaultTimeout

		if (timeout !== Infinity) {
			pend.timer = setTimeout(() => {
				const pending = this.#pending.get(id)
				if (pending) {
					this.#pending.delete(id)
					pending.deferred.resolve(err(`${call[0].join(".")} timed out after ${timeout} ms`))
				}
			}, timeout)
		}
		try {
			this.#onSend.publish([MessageKind.Request, id, call])
		}
		catch (error) {
			this.#pending.delete(id)
			clearTimeout(pend.timer)
			deferred.resolve(err(errorString(error, "send failed")))
		}
		return deferred.promise
	}

	readonly remote = makeRemote<RemoteFns>(this.remoteEndpoint)

	readonly onSend = this.#onSend.on

	readonly recv = async(msg: Message) => {
		if (this.#disposed) return
		switch (msg[0]) {
			case MessageKind.Request: return this.#recvCall(msg)
			case MessageKind.Response: return this.#recvRet(msg)
		}
	}

	readonly dispose = () => {
		this.#disposed = true
		for (const [id, pending] of this.#pending) {
			this.#pending.delete(id)
			clearTimeout(pending.timer)
			pending.deferred.resolve(err("messenger disposed"))
		}
	}

	async #recvCall([, id, call]: Request) {
		const ret = await this.#localEndpoint(call)
		if (this.#disposed) return
		this.#onSend.publish([MessageKind.Response, id, ret])
	}

	async #recvRet([, id, ret]: Response) {
		const pending = this.#pending.get(id)
		if (pending) {
			this.#pending.delete(id)
			clearTimeout(pending.timer)
			pending.deferred.resolve(ret)
		}
	}
}

