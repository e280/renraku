
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {HttpServer} from "../../http/server.js"
import {example} from "../../http/examples/api.js"
import {LoggerTap} from "../../../core/taps/logger.js"

export const port = 8001
export const logger = new LoggerTap()

const server = new HttpServer({
	tap: logger,
	expose: () => example,
})

server.webSockets<ExampleClientsideFns>({
	accept: _connection => ({
		expose: exampleServersideApi,
		onDisconnect: () => {},
	}),
})

await server.listen({port})
await logger.log(`ws :${port}...`)

