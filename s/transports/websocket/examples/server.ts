
import {webSocketServer} from "../server.js"
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {LoggerTap} from "../../../core/taps/logger.js"

export const port = 8001
export const logger = new LoggerTap()

await webSocketServer<ExampleClientsideFns>({
	port,
	tap: logger,
	accept: _connection => ({
		expose: exampleServersideApi,
		onDisconnect: () => {},
	}),
})

await logger.log(`websocket :${port}...`)

