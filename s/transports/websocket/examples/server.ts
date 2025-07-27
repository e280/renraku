
import {WebSocketServer} from "../server.js"
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {example} from "../../http/examples/api.js"
import {LoggerTap} from "../../../core/taps/logger.js"

export const port = 8001
export const logger = new LoggerTap()

const server = new WebSocketServer<ExampleClientsideFns>({
	tap: logger,

	// plain json-rpc api
	expose: () => example,

	// web socket api
	accept: _connection => ({
		expose: exampleServersideApi,
		onDisconnect: () => {},
	}),
})

await server.listen({port})
await logger.log(`ws :${port}...`)

