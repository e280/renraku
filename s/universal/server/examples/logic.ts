
import {asRpc} from "../types.js"
import {AsFns} from "../../core/types.js"
import {secure} from "../../core/auth/secure.js"
import {asAccepter, asConnector} from "../../transports/websocket/types.js"

export type ExRpc = ReturnType<typeof exampleRpc>

export type ExServerside = AsFns<{
	now(): Promise<number>
}>

export type ExClientside = AsFns<{
	sum(a: number, b: number): Promise<number>
}>

export type ExampleRpc = Awaited<ReturnType<typeof exampleRpc>>

/** example http json-rpc server fns */
export const exampleRpc = asRpc(async _meta => ({

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

/** example websocket serverside */
export const exampleAccepter = asAccepter<ExServerside, ExClientside>(async connection => {
	const clientside = connection.remote
	return {
		fns: {
			async now() {
				await clientside.sum(1, 2)
				return Date.now()
			},
		},
		disconnected: () => {},
	}
})

/** example websocket clientside */
export const exampleConnector = (rememberCall: () => void) => (
	asConnector<ExClientside, ExServerside>(async _connection => {
		return {
			fns: {
				async sum(a: number, b: number) {
					rememberCall()
					return a + b
				},
			},
			disconnected: () => {},
		}
	})
)

