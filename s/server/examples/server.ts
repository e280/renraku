
import {Server} from "../server.js"
import {ExClientside} from "./types.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {route} from "../../transports/http/parts/routing.js"
import {exampleHttpRpc, exampleWsServersideRpc} from "./rpcs.js"
import {respond} from "../../transports/http/parts/responding.js"

export const port = 8000
export const logger = new LoggerTap()

await new Server({
	tap: logger,
	cors: {origins: "*"},
	rpc: exampleHttpRpc,
	websocket: Server.websocket<ExClientside>(async _connection => ({
		rpc: exampleWsServersideRpc,
		disconnected: () => {},
	})),
	routes: [
		route.get("/lol", respond.text("rofl")),
	],
}).listen(port)

await logger.log(`renraku server :${port}...`)

