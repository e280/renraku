
import {ExClientside} from "./types.js"
import {RenrakuServer} from "../renraku-server.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {route} from "../../transports/http/parts/routing.js"
import {exampleHttpRpc, exampleWsServersideRpc} from "./rpcs.js"
import {respond} from "../../transports/http/parts/responding.js"

export const port = 8000
export const logger = new LoggerTap()

const server = new RenrakuServer({
	tap: logger,
	cors: {origins: "*"},
	rpc: exampleHttpRpc,
	websocket: RenrakuServer.websocket<ExClientside>(_connection => ({
		rpc: exampleWsServersideRpc,
		disconnected: () => {},
	})),
	routes: [
		route.get("/lol", respond.text("rofl")),
	],
})

await server.listen({port})
await logger.log(`renraku server :${port}...`)

