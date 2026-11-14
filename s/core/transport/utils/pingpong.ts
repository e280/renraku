
import {cycle, deadline, defaultTimeout, defer, Deferred, hex, Json, nap, Rollerstat} from "@e280/stz"
import {heartbeatInterval} from "../../../consts.js"

type Ping = [kind: "ping", id: string]
type Pong = [kind: "pong", id: string]
type Data<X> = [kind: "data", x: X]

export class Pingpong<X extends Json = any> {
	readonly rtt = new Rollerstat(10)

	#send
	#recvData
	#pending = new Map<string, {time: number, deferred: Deferred<number>}>()

	constructor(options: {
			send: (message: Ping | Pong | Data<X>) => void
			recvData: (x: X) => (void | Promise<void>)
		}) {
		this.#send = options.send
		this.#recvData = options.recvData
	}

	sendData = (x: X) => this.#send(["data", x])

	ping = async(timeout = defaultTimeout) => {
		const id = hex.random(16)
		const deferred = defer<number>()

		this.#pending.set(id, {deferred, time: performance.now()})
		this.#send(["ping", id])

		return deadline(timeout, deferred.promise)
			.then(rtt => {
				this.#pending.delete(id)
				this.rtt.add(rtt)
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
				return this.#send(["pong", data[1]])

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
				return this.#recvData(data[1])
		}
	}

	heartbeat = (interval = heartbeatInterval) => cycle(async() => {
		await this.ping().catch(() => {})
		await nap(interval)
	})

	dispose = () => {
		for (const {deferred} of this.#pending.values())
			deferred.reject(new Error("pingpong disposed"))
		this.#pending.clear()
	}
}

