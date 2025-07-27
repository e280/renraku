
import {pub} from "@e280/stz"
import {JsonRpc} from "../../../core/json-rpc.js"

export class Conduit {
	recv = pub<[incoming: JsonRpc.Bidirectional, {origin: string}]>()
	sendRequest = pub<[request: JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	sendResponse = pub<[response: JsonRpc.Respondish, transfer: Transferable[] | undefined]>()

	static makeEntangledPair({origin = "example.e280.org"}: {origin?: string} = {}) {
		const a = new this()
		const b = new this()

		const disposers = [
			a.sendRequest.sub(data => b.recv(data, {origin})),
			a.sendResponse.sub(data => b.recv(data, {origin})),
			b.sendRequest.sub(data => a.recv(data, {origin})),
			b.sendResponse.sub(data => a.recv(data, {origin})),
		]

		const dispose = () => disposers.forEach(fn => fn())
		return [a, b, dispose] as [Conduit, Conduit, () => void]
	}
}

