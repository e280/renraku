
import * as http from "node:http"
import {transmute} from "./transmuting.js"
import {defaults} from "../../defaults.js"
import {ListenHttpOptions, NiceServerOptions} from "./types.js"

/** ergonomic improvement over node's stock http server */
export class NiceServer {
	stock: http.Server

	constructor(options: NiceServerOptions) {
		const listener = transmute(options.listener, options.transmuters ?? [])
		this.stock = new http.Server(listener)
		this.stock.timeout = options.timeout ?? defaults.timeout
	}

	async listen({port, host}: ListenHttpOptions) {
		await new Promise<void>((resolve, reject) => {
			this.stock.once("error", reject)
			const r = () => resolve()
			if (host) this.stock.listen(host, port, r)
			else this.stock.listen(port, r)
		})
	}

	close() {
		this.stock.close()
	}
}

