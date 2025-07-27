
import {secure} from "../../core/auth/secure.js"
import {fns} from "../../core/types.js"
import {Rig} from "../../transports/messenger/parts/helpers.js"
import {ExClientside, ExServerside} from "./types.js"

/** example http json-rpc server fns */
export const exampleHttpFns = fns({

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
})

/** example websocket serverside fns */
export const exampleWsServerside = (
	(clientside: ExClientside, _rig: Rig): ExServerside => ({

	async now() {
		await clientside.sum(1, 2)
		return Date.now()
	},
}))

/** example websocket clientside fns */
export const exampleWsClientside = (
	(_serverside: ExServerside, _rig: Rig, rememberCall: () => void) => ({

	async sum(a: number, b: number) {
		rememberCall()
		return a + b
	},
}))

