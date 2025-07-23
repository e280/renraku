
import {webSocketServer} from "../server.js"
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {LoggerTap} from "../../../core/taps/logger.js"

export const logger = new LoggerTap()

await webSocketServer<ExampleClientsideFns>({
	port: 8000,
	tap: logger,
	accept: connection => ({
		fns: exampleServersideApi(connection.clientside),
		onDisconnect: () => logger.log("got disconected"),
	}),
})

await logger.log("example websocket server listening...")

