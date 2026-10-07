
import {deadline, defaultTimeout, defer, Deferred, hex, Rollerstat, sub} from "@e280/stz"

type Ping = [kind: "ping", id: string]
type Pong = [kind: "pong", id: string]
type Data<X> = [kind: "data", x: X]

export class Pingpong<X> {
	onRtt = sub<[number]>()
	readonly rtt = new Rollerstat(10)

	#pending = new Map<string, {time: number, deferred: Deferred<number>}>()

	constructor(
		public send: (message: Ping | Pong) => void,
		public forward: (x: X) => Promise<void>,
	) {}

	async ping(timeout = defaultTimeout) {
		const id = hex.random(16)
		const deferred = defer<number>()

		this.#pending.set(id, {deferred, time: performance.now()})
		this.send(["ping", id])

		return deadline(timeout, deferred.promise)
			.then(rtt => {
				this.#pending.delete(id)
				this.rtt.add(rtt)
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
				const pend = this.#pending.get(id)
				if (pend) {
					const rtt = performance.now() - pend.time
					pend.deferred.resolve(rtt)
				}
				return
			}

			case "data":
				return this.forward(data[1])
		}
	}
}

