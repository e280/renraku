
import {defer, Deferred, err, errorString, GMap, nap} from "@e280/stz"
import {Fns, Ret} from "../base/types.js"
import {makeRemote} from "../base/remote.js"
import {makeEndpoint} from "../base/endpoint.js"
import {Request, Message, MessageKind, Response} from "./types.js"

/** bidirectional messenger */
export class Messenger<RemoteFns extends Fns> {
	#id = 0
	#localEndpoint
	#pending = new GMap<number, Deferred<Ret>>()

	constructor(private options: {
			send: (msg: Message) => void
			fns?: Fns
			timeout?: number
		}) {
		this.#localEndpoint = makeEndpoint(options.fns ?? {})
	}

	remote = makeRemote<RemoteFns>(async call => {
		const id = this.#id++
		const deferred = defer<Ret>()
		this.#pending.set(id, deferred)
		nap(this.options.timeout ?? 60_000).then(() => {
			const deferred = this.#pending.get(id)
			if (deferred) {
				this.#pending.delete(id)
				deferred.resolve(err("timed out"))
			}
		})
		try {
			this.options.send([MessageKind.Request, id, call])
		}
		catch (error) {
			this.#pending.delete(id)
			deferred.resolve(err(errorString(error, "send failed")))
		}
		return deferred.promise
	})

	recv = async(msg: Message) => {
		switch (msg[0]) {
			case MessageKind.Request: return this.#recvCall(msg)
			case MessageKind.Response: return this.#recvRet(msg)
		}
	}

	async #recvCall([, id, call]: Request) {
		const ret = await this.#localEndpoint(call)
		this.options.send([MessageKind.Response, id, ret])
	}

	async #recvRet([, id, ret]: Response) {
		const pending = this.#pending.get(id)
		if (pending) {
			this.#pending.delete(id)
			pending.resolve(ret)
		}
	}
}

