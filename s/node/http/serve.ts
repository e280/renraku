
import {createServer, Server} from "node:http"
import {httpListener} from "./listener.js"
import {Fns} from "../../core/base/types.js"
import {makeEndpoint} from "../../core/base/endpoint.js"

export async function serve(port: number, fns: Fns) {
	return new Promise<Server>((resolve, reject) => {
		const server = createServer(httpListener(makeEndpoint(fns)))

		server.once("error", reject)

		server.listen(port, () => {
			server.off("error", reject)
			resolve(server)
		})
	})
}

