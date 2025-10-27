
import * as http from "node:http"

import {defaults} from "../../../universal/defaults.js"
import {HttpServerOptions} from "./types.js"
import {transmute} from "./parts/transmuting.js"

/** ergonomic improvement over node's stock http server */
export class HttpServer {
	stock: http.Server

	constructor(options: HttpServerOptions) {
		const listener = transmute(options.listener, options.transmuters ?? [])
		this.stock = new http.Server(listener)
		this.stock.timeout = options.timeout ?? defaults.timeout
	}

	async listen(port: number, host?: string) {
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

