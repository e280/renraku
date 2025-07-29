
import {ExServerside} from "./types.js"
import {authorize} from "../../core/auth/authorize.js"
import {httpRemote} from "../../transports/http/remote.js"
import {wsClient} from "../../transports/websocket/client.js"
import {exampleHttpRpc, exampleWsClientsideRpc} from "./rpcs.js"

export async function exampleClient() {
	let calls = 0
	let rememberCall = () => calls++
	const httpUrl = "http://localhost:8000/"
	const wsUrl = "ws://localhost:8000/"

	//
	// http json rpc api
	//
	try {
		const service = httpRemote<ReturnType<typeof exampleHttpRpc>>({url: httpUrl})
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
		const client = await wsClient<ExServerside>({
			socket: new WebSocket(wsUrl),
			rpc: exampleWsClientsideRpc(rememberCall),
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

