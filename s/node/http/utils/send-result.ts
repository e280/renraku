
import {ServerResponse} from "node:http"
import {Ret} from "../../../core/base/types.js"

export function sendResult(response: ServerResponse) {
	return (ret: Ret) => {
		response.writeHead(200, {"content-type": "application/json"})
		response.end(JSON.stringify(ret))
	}
}

