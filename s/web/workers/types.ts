
import {Fns, Remote} from "../../core/base/types.js"

export type WorkerConnection<F extends Fns> = {
	remote: Remote<F>
	dispose: () => void
}

