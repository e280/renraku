
import {webSocketRemote} from "../client.js"
import {exampleClientsideApi} from "./apis.js"
import {ExampleServersideFns} from "./types.js"

export async function exampleWebsocketClient() {
	let calls = 0
	let rememberCall = () => calls++

	const socket = new WebSocket("http://localhost:8001")

	const {remote, dispose} = await webSocketRemote<ExampleServersideFns>({
		socket,
		accept: (serverside, rig) => exampleClientsideApi(serverside, rig, rememberCall),
		onDisconnect: () => console.error("🟥 websocket disconnected"),
	})

	{
		const result = await remote.now()

		if (typeof result === "number" && calls === 1)
			console.log("✅ websocket call works", result, calls)
		else
			console.error("🟥 websocket call failed", result, calls)
	}

	dispose()
	socket.close()
}

