//
// import {GMap} from "@e280/stz"
// import {Fns, Ret} from "./types.js"
//
// export class Connection<RemoteFns extends Fns> {
// 	remote
// 	#socket
// 	#assembler = {} as any // TODO
// 	#waitingForRet = new GMap<number, (ret: Ret) => void>
// 	#outgoingStreams = new GMap<number, WritableStream>()
// 	#incomingStreams = new GMap<number, TransformStream>()
//
// 	constructor(
// 			fns: Fns,
// 			socket: {readable: ReadableStream, writable: WritableStream},
// 		) {
// 		this.#socket = socket
// 		this.remote = makeRemote<RemoteFns>()
// 	}
//
// 	async #recv(data: Uint8Array) {
// 		for (const packet of this.#assembler.add(data)) {
//
// 			// we've received a fn call
// 			if (isCallPacket(packet)) {
// 				const {id, method, params} = parseCallPacket(packet)
// 				// TODO
// 			}
//
// 			// we've received a fn return
// 			else if (isRetPacket(packet)) {
// 				const {id, ret} = parseRetPacket(packet)
// 				this.#waitingForRet.need(id)(ret)
// 				this.#waitingForRet.delete(id)
// 			}
//
// 			// we're receiving some streaming data
// 			else if (isStreamPacket(packet)) {
// 				const {id, chunk} = parseStreamPacket(packet)
// 				const stream = this.#incomingStreams.need(streamPacket.id)
// 				await stream.writable.getWriter().write(streamPacket.chunk)
// 			}
//
// 			// is stream packet
// 			else throw new Error("unknown packet kind")
// 		}
// 	}
// }
//
// export function makeRemote<F extends Fns>() {
// 	// TODO
// 	return new Proxy({}, {}) as F
// }
//
//
