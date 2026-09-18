
import {Fns, Remote} from "../../core/base/types.js"

export type NodeWorkerConnection<F extends Fns> = {
	remote: Remote<F>
	dispose: () => Promise<number>
}

