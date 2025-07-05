
import {example} from "./api.js"
import {httpServer} from "../server.js"
import {LoggerTap} from "../../../core/taps/logger.js"

const logger = new LoggerTap()

await httpServer({
	port: 8000,
	tap: logger,
	expose: () => example,
})

logger.log("example http server listening...")

