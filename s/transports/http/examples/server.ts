
import {example} from "./api.js"
import {HttpServer} from "../server.js"
import {LoggerTap} from "../../../core/taps/logger.js"

const port = 8000
const logger = new LoggerTap()

const server = new HttpServer({
	tap: logger,
	expose: () => example,
})

await server.listen({port})
logger.log(`http :${port}...`)

