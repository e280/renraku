
import * as http from "node:http"
import {defaults} from "../../defaults.js"
import {transmute, Transmuter} from "./http-kit.js"

/** ergonomic improvement over node's stock http server */
export class NiceHttpServer {
	stock: http.Server

	constructor(options: {
			listener: http.RequestListener
			timeout?: number
			transmuters?: Transmuter[]
		}) {
		const listener = transmute(options.listener, options.transmuters ?? [])
		this.stock = new http.Server(listener)
		this.stock.timeout = options.timeout ?? defaults.timeout
	}

	async listen({port, host}: {port: number, host?: string}) {
		return new Promise<NiceHttpServer>((resolve, reject) => {
			this.stock.once("error", reject)
			const r = () => resolve(this)
			if (host) this.stock.listen(host, port, r)
			else this.stock.listen(port, r)
		})
	}
}

