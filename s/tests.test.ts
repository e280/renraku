
import {Science} from "@e280/science"
import core from "./core/core.test.js"
import messenger from "./transports/messenger/messenger.test.js"
import pingponger from "./tools/pingponger.test.js"

await Science.run({core, messenger, pingponger})

