
import {Messenger} from "../messenger.js"
import {Conduit} from "../conduits/conduit.js"
import {makeEndpoint} from "../../../core/endpoint.js"
import {MathFns, setupMathSpy} from "../../../core/testing/setup-math-spy.js"

export function setupSide(conduit: Conduit) {
	const math = setupMathSpy()
	return {
		...math,
		messenger: new Messenger<MathFns>({
			conduit,
			getLocalEndpoint: async() => makeEndpoint({fns: math.fns}),
		}),
	}
}

