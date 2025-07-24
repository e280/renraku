
import {Logger} from "@e280/sten"
import {Tap, HttpMeta, WebSocketTaps} from "../types.js"
import {RandomUserEmojis} from "../../tools/random-user-emojis.js"

export class LoggerTap extends Logger implements Tap {
	static dummy() {
		return new this().setWriter(Logger.writers.void())
	}

	request: Tap["request"] = async({request, label}) => {
		const g = this.colors.none
		this.log(
			...[label].filter(Boolean),
			g(`${request.method}()`),
		)
	}

	rpcError: Tap["rpcError"] = async({request, error, label}) => {
		this.error(
			...[label].filter(Boolean),
			`${request.method}()`,
			error,
		)
	}

	#emojis = new RandomUserEmojis()

	#requestInfo(meta: HttpMeta) {
		return [
			this.colors.yellow(`[${meta.ip}]`),
			this.colors.green(meta.headers.origin ?meta.headers.origin :"(no-origin)"),
		].join(" ")
	}

	http(meta: HttpMeta): Tap {
		const label = this.#requestInfo(meta)
		return {
			error: this.error.bind(this),
			request: o => this.request({...o, label}),
			rpcError: o => this.rpcError({...o, label}),
		}
	}

	webSocket(meta: HttpMeta): WebSocketTaps {
		const info = this.#requestInfo(meta)
		const emoji = this.#emojis.pull()
		const g = this.colors.yellow
		const prep = (isRemote: boolean): Tap => {
			const label = info + " " + (
				isRemote
					? emoji + g(" <-")
					: emoji + g(" ->")
			)
			return {
				error: this.error.bind(this),
				request: o => this.request({...o, label}),
				rpcError: o => this.rpcError({...o, label}),
			}
		}
		return {
			remote: prep(true),
			local: prep(false),
		}
	}
}

