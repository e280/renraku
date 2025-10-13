
import {Logger} from "@e280/sten"
import {Tap, HttpMeta, TapContext} from "../types.js"

export class LoggerTap extends Logger implements Tap {
	static dummy() {
		return new this().setWriter(Logger.writers.void())
	}

	rpcRequest: Tap["rpcRequest"] = async({request, ...context}) => {
		const g = this.colors.none
		this.log(
			...this.#context(context),
			g(`${request.method}()`),
		)
	}

	rpcError: Tap["rpcError"] = async({request, error, ...context}) => {
		this.error(
			...this.#context(context),
			`${request.method}()`,
			error,
		)
	}

	#context({meta, label, remote}: TapContext) {
		const cRemote = this.colors.mix(this.colors.blue, this.colors.dim)
		const cLocal = this.colors.mix(this.colors.cyan, this.colors.dim)
		return [
			meta
				? this.#meta(meta)
				: undefined,
			label
				? label
				: undefined,
			remote === undefined
				? undefined
				: remote
					? cRemote("<-")
					: cLocal("->"),
		].filter(Boolean)
	}

	#meta(meta: HttpMeta) {
		const {headers} = meta.request
		return [
			this.colors.yellow(`[${meta.ip}]`),
			this.colors.green(headers.origin ?headers.origin :"(no-origin)"),
		].join(" ")
	}
}

