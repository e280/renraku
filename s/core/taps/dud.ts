
import {Tap} from "../types.js"

export class DudTap implements Tap {
	error: Tap["error"] = async() => {}
	rpcRequest: Tap["rpcRequest"] = async() => {}
	rpcError: Tap["rpcError"] = async() => {}
}

