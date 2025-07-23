
import {webSocketRemote} from "../client.js"
import {exampleClientsideApi} from "./apis.js"
import {ExampleServersideFns} from "./types.js"
import {endpoint} from "../../../core/endpoint.js"

export async function exampleWebsocketClient() {
	let calls = 0
	let rememberCall = () => calls++

	const {socket, remote: serverside} = await webSocketRemote<ExampleServersideFns>({
		url: "http://localhost:8001",
		getLocalEndpoint: fns => endpoint({
			fns: exampleClientsideApi(fns, rememberCall),
		}),
		onClose: () => console.log("web socket remote disconnected"),
	})

	const result = await serverside.now()
	socket.close()

	if (typeof result === "number" && calls === 1)
		console.log("✅ websocket call works", result, calls)
	else
		console.error("🟥 websocket call failed", result, calls)
}

