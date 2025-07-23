
import {exampleHttpClient} from "../transports/http/examples/client.js"
import {exampleWebsocketClient} from "../transports/websocket/examples/client.js"

console.log("renraku")
await exampleHttpClient()
await exampleWebsocketClient()

