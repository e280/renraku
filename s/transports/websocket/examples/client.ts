
import {webSocketRemote} from "../client.js"
import {exampleClientsideApi} from "./apis.js"
import {ExampleServersideFns} from "./types.js"
import {httpRemote} from "../../http/client.js"
import {example} from "../../http/examples/api.js"

export async function exampleWebsocketClient() {
	let calls = 0
	let rememberCall = () => calls++
	const url = "http://localhost:8001"

	//
	// web socket api
	//
	{
		const socket = new WebSocket(url)
		const {remote, dispose} = await webSocketRemote<ExampleServersideFns>({
			socket,
			expose: (serverside, rig) => exampleClientsideApi(serverside, rig, rememberCall),
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

	//
	// http json rpc api (in the same websocket server)
	//
	{
		const http = httpRemote<typeof example>({url})
		const result = await http.unlocked.sum(1, 2)

		if (result === 3)
			console.log("✅ websocket+http good", result)
		else
			console.error("🟥 websocket+http bad", result)
	}
}

