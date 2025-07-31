
import {Fns} from "../../../core/types.js"
import {Remote} from "../../../core/remote-proxy.js"

export class MessengerMeta<F extends Fns> {
	transfer: Transferable[] | undefined = undefined

	constructor(public remote: Remote<F>) {}
}

