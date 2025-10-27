
import {Server} from "../server.js"
import {LoggerTap} from "../../../universal/core/taps/logger.js"
import {exampleRpc, exampleAccepter} from "./logic.js"
import {route} from "../../transports/http/parts/routing.js"
import {respond} from "../../transports/http/parts/responding.js"

export const port = 8000
export const logger = new LoggerTap()

await new Server({
	tap: logger,
	cors: {origins: "*"},
	routes: [route.get("/lol", respond.text("rofl"))],
	rpc: exampleRpc,
	websocket: exampleAccepter,
}).listen(port)

await logger.log(`renraku server :${port}...`)

