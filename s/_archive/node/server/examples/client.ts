
import {exampleConnector, ExampleRpc} from "./logic.js"
import {authorize} from "../../../universal/core/auth/authorize.js"
import {httpRemote} from "../../transports/http/remote.js"
import {wsConnect} from "../../transports/websocket/connect.js"

export async function exampleClient() {
	let calls = 0
	let rememberCall = () => calls++
	const httpUrl = "http://localhost:8000/"
	const wsUrl = "ws://localhost:8000/"

	//
	// http json rpc api
	//
	try {
		const service = httpRemote<ExampleRpc>({url: httpUrl})
		const unlocked = service.unlocked
		const locked = authorize(service.locked, async() => "hello")

		const result1 = await unlocked.sum(1, 2)
		const result2 = await locked.now()

		if (result1 === 3 && typeof result2 === "number")
			console.log("✅ http good", result1, result2)
		else
			console.error("🟥 http bad", result1, result2)
	}
	catch (error) {
		console.error(error)
	}

	//
	// web socket api
	//
	try {
		const client = await wsConnect({
			socket: new WebSocket(wsUrl),
			connector: exampleConnector(rememberCall),
			disconnected: () => console.error("🟥 websocket disconnected"),
		})

		const result = await client.remote.now()
		if (typeof result === "number" && calls === 1) {
			console.log("✅ websocket good", result, calls)
			console.log(`   ${client.rtt.latest.toFixed(0)} ms`)
		}
		else
			console.error("🟥 websocket bad", result, calls)

		client.close()
	}
	catch (error) {
		console.error(error)
	}
}

