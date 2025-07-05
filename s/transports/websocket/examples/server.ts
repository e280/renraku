
import {WebSocketServer} from "../server.js"
import {remote} from "../../../core/remote.js"
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {endpoint} from "../../../core/endpoint.js"
import {LoggerTap} from "../../../core/taps/logger.js"

export const logger = new LoggerTap()

const server = new WebSocketServer({
	acceptConnection: async connection => {
		const personalLogger = logger.webSocket(connection)
		const clientside = remote<ExampleClientsideFns>({
			endpoint: connection.remoteEndpoint,
			tap: personalLogger.remote,
		})
		return {
			closed: () => {},
			localEndpoint: endpoint({
				fns: exampleServersideApi(clientside),
				tap: personalLogger.local,
			}),
		}
	},
})

server.listen(8000, () => logger.log("example websocket server listening..."))

