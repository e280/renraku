
import {deadline, defer, Deferred, IdCounter, nap, sub, cycle} from "@e280/stz"
import {Averager} from "./averager.js"
import {appropriateHeartbeat} from "./appropriate-heartbeat.js"

export type Ping = ["ping", number]
export type Pong = ["pong", number]

export class Rtt {
	constructor(private pingponger: Pingponger) {}
	get on() { return this.pingponger.onRtt }
	get latest() { return this.pingponger.latestRtt }
	get average() { return this.pingponger.averageRtt }
}

export class Pingponger {
	onRtt = sub<[number]>()

	#id = new IdCounter()
	#rtt = 99
	#averager = new Averager(5)
	#pends = new Map<number, {time: number, deferred: Deferred<number>}>()

	constructor(public options: {
		timeout: number
		send: (p: Ping | Pong) => void
	}) {}

	get latestRtt() {
		return this.#rtt
	}

	get averageRtt() {
		return this.#averager.average
	}

	async ping() {
		const pingId = this.#id.next()
		const time = Date.now()
		const deferred = defer<number>()

		this.#pends.set(pingId, {time, deferred})
		this.options.send(["ping", pingId])

		return deadline(this.options.timeout, () => deferred.promise)
			.finally(() => this.#prune())
	}

	recv([kind, id]: Ping | Pong) {
		if (kind === "ping")
			this.options.send(["pong", id])

		else if (kind === "pong")
			this.#handlePong(id)

		else
			throw new Error(`unknown pingpong message kind: ${kind}`)
	}

	/** start an ongoing heartbeat */
	heartbeat(onTimeout: (error: any) => void = () => {}) {
		const ms = appropriateHeartbeat(this.options.timeout)
		return cycle(async stop => {
			try {
				await this.ping()
				await nap(ms)
			}
			catch (error) {
				stop()
				onTimeout(error)
			}
		})
	}

	#handlePong(pingId: number) {
		const pend = this.#pends.get(pingId)
		if (pend === undefined) return

		this.#rtt = Date.now() - pend.time
		this.#averager.add(this.#rtt)

		this.#pends.delete(pingId)
		pend.deferred.resolve(this.#rtt)
		this.onRtt.pub(this.#rtt)
	}

	#prune() {
		const now = Date.now()
		for (const [pingId, pend] of this.#pends) {
			if ((now - pend.time) > this.options.timeout) {
				this.#pends.delete(pingId)
				pend.deferred.reject("ping timeout")
			}
		}
	}
}

