
import {Fns} from "../../core/types.js"
import {Remote} from "../../core/remote-proxy.js"

export class MessengerMeta<RemoteFns extends Fns> {
	transfer: any[] | undefined

	constructor(public remote: Remote<RemoteFns>) {}
}

