
import {Messenger} from "../messenger.js"
import {Conduit} from "../conduits/conduit.js"
import {MathFns, setupMathSpy} from "../../../core/testing/setup-math-spy.js"

export function setupSide(conduit: Conduit) {
	const math = setupMathSpy()
	return {
		...math,
		messenger: new Messenger<MathFns>({
			conduit,
			rpc: async() => math.fns,
		}),
	}
}

