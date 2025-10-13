
import {Science} from "@e280/science"
import core from "./universal/core/core.test.js"
import messenger from "./universal/transports/messenger/messenger.test.js"
import pingponger from "./universal/tools/pingponger.test.js"

await Science.run({core, messenger, pingponger})

