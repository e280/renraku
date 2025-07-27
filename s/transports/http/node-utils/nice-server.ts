
import * as http from "node:http"
import {defaults} from "../../defaults.js"

/** just an ergonomic improvement over the stock http server */
export class NiceServer {
	stock: http.Server

	constructor(options: {
			fn: http.RequestListener
			timeout?: number
		}) {
		this.stock = new http.Server(options.fn)
		this.stock.timeout = options.timeout ?? defaults.timeout
	}

	async listen({port, host}: {port: number, host?: string}) {
		return new Promise<NiceServer>((resolve, reject) => {
			this.stock.once("error", reject)
			const r = () => resolve(this)
			if (host) this.stock.listen(host, port, r)
			else this.stock.listen(port, r)
		})
	}
}

