
import {Rig} from "../../messenger/parts/helpers.js"
import {ExampleClientsideFns, ExampleServersideFns} from "./types.js"

export const exampleServersideApi = (
	(clientside: ExampleClientsideFns, _rig: Rig): ExampleServersideFns => ({

	async now() {
		await clientside.sum(1, 2)
		return Date.now()
	},
}))

export const exampleClientsideApi = (
	(_serverside: ExampleServersideFns, _rig: Rig, rememberCall: () => void) => ({

	async sum(a: number, b: number) {
		rememberCall()
		return a + b
	},
}))

