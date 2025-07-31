
import {Tap} from "../types.js"
import {LoggerTap} from "./logger.js"

export class ErrorTap extends LoggerTap implements Tap {
	rpcRequest: Tap["rpcRequest"] = async() => {}
}

