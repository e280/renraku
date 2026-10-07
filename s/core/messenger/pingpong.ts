
import {deadline, defaultTimeout, defer, Deferred, got, hex, sub} from "@e280/stz"

type Ping = [kind: "ping", id: string]
type Pong = [kind: "pong", id: string]
type Data<X> = [kind: "data", x: X]

export class Pingpong<X> {
	onRtt = sub<[number]>()

	#rtt: number | undefined
	#pending = new Map<string, {time: number, deferred: Deferred<number>}>()

	constructor(
		public send: (message: Ping | Pong) => void,
		public forward: (x: X) => Promise<void>,
	) {}

	get rtt() {
		return this.#rtt
	}

	async ping(timeout = defaultTimeout) {
		const id = hex.random(16)
		const deferred = defer<number>()

		this.#pending.set(id, {deferred, time: performance.now()})
		this.send(["ping", id])

		return deadline(timeout, deferred.promise)
			.then(rtt => {
				this.#pending.delete(id)
				this.#rtt = rtt
				this.onRtt.publish(rtt)
				return rtt
			})
			.catch(error => {
				this.#pending.delete(id)
				deferred.reject(error)
				throw error
			})
	}

	recv = async(data: Ping | Pong | Data<X>) => {
		switch (data[0]) {

			case "ping":
				return this.send(["pong", data[1]])

			case "pong": {
				const id = data[1]
				const pend = got(this.#pending.get(id))
				const rtt = performance.now() - pend.time
				pend.deferred.resolve(rtt)
				return
			}

			case "data":
				return this.forward(data[1])
		}
	}
}

