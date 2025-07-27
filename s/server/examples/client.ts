
import {ExServerside} from "./types.js"
import {exampleHttpFns, exampleWsClientside} from "./apis.js"
import {httpRemote} from "../../transports/http/remote.js"
import {webSocketRemote} from "../../transports/websocket/remote.js"
import {authorize} from "../../core/auth/authorize.js"

export async function exampleClient() {
	let calls = 0
	let rememberCall = () => calls++
	const url = "http://localhost:8001"

	//
	// web socket api
	//
	try {
		const socket = new WebSocket(url)
		const {remote, dispose} = await webSocketRemote<ExServerside>({
			socket,
			rpc: (serverside, rig) => exampleWsClientside(serverside, rig, rememberCall),
			onDisconnect: () => console.error("🟥 websocket disconnected"),
		})

		const result = await remote.now()
		if (typeof result === "number" && calls === 1)
			console.log("✅ websocket good", result, calls)
		else
			console.error("🟥 websocket bad", result, calls)

		dispose()
		socket.close()
	}
	catch (error) {
		console.error(error)
	}

	//
	// http json rpc api
	//
	try {
		const service = httpRemote<typeof exampleHttpFns>({url})
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
}

