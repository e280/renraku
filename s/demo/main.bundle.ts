
import {exampleHttpClient} from "../transports/http/examples/client.js"
import {exampleWebsocketClient} from "../transports/websocket2/examples/client.js"

console.log("renraku")
await exampleHttpClient()
await exampleWebsocketClient()

