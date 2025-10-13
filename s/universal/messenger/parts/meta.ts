
import {Fns} from "../../core/types.js"
import {Remote} from "../../core/remote-proxy.js"

export class MessengerMeta<RemoteFns extends Fns> {
	transfer: Transferable[] | undefined

	constructor(public remote: Remote<RemoteFns>) {}
}

