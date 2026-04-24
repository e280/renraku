
import {defer, Deferred, err, errorString, GMap, nap} from "@e280/stz"
import {Fns, Ret} from "../parts/types.js"
import {makeRemote} from "../parts/remote.js"
import {makeEndpoint} from "../parts/endpoint.js"
import {CallMsg, Msg, MsgKind, RetMsg} from "./types.js"

export class Conduit<RemoteFns extends Fns> {
	#id = 0
	#localEndpoint
	#pending = new GMap<number, Deferred<Ret>>()

	constructor(private options: {
			send: (msg: Msg) => void
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
			this.options.send([MsgKind.Call, id, call])
		}
		catch (error) {
			this.#pending.delete(id)
			deferred.resolve(err(errorString(error, "send failed")))
		}
		return deferred.promise
	})

	recv = async(msg: Msg) => {
		switch (msg[0]) {
			case MsgKind.Call: return this.#recvCall(msg)
			case MsgKind.Ret: return this.#recvRet(msg)
		}
	}

	async #recvCall([, id, call]: CallMsg) {
		const ret = await this.#localEndpoint(call)
		this.options.send([MsgKind.Ret, id, ret])
	}

	async #recvRet([, id, ret]: RetMsg) {
		const pending = this.#pending.get(id)
		if (pending) {
			this.#pending.delete(id)
			pending.resolve(ret)
		}
	}
}

