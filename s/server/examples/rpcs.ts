
import {asHttpRpc} from "../types.js"
import {secure} from "../../core/auth/secure.js"
import {ExClientside, ExServerside} from "./types.js"
import {asWsRpc} from "../../transports/websocket/types.js"

/** example http json-rpc server fns */
export const exampleHttpRpc = asHttpRpc(_meta => ({

	// unauthenticated service
	unlocked: {
		async sum(a: number, b: number) {
			return a + b
		},
	},

	// authenticated service
	locked: secure(async(auth: string) => {

		if (auth !== "hello")
			throw new Error("invalid auth")

		return {
			async now() {
				return Date.now()
			},
		}
	}),
}))

/** example websocket serverside fns */
export const exampleWsServersideRpc = asWsRpc<ExServerside, ExClientside>(clientside => ({
	async now() {
		await clientside.sum(1, 2)
		return Date.now()
	},
}))

/** example websocket clientside fns */
export const exampleWsClientsideRpc = (rememberCall: () => void) => (
	asWsRpc<ExClientside, ExServerside>(_serverside => ({
		async sum(a: number, b: number) {
			rememberCall()
			return a + b
		},
	}))
)

