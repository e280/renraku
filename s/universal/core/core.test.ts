
import {Science, test, expect} from "@e280/science"
import {makeRemote} from "./remote.js"
import {makeEndpoint} from "./endpoint.js"
import {setupMathSpy} from "./testing/setup-math-spy.js"

export default Science.suite({
	"remote can call fns": test(async() => {
		const math = setupMathSpy()
		const mathEndpoint = makeEndpoint({fns: math.fns})
		const mathRemote = makeRemote<typeof math.fns>({endpoint: mathEndpoint})
		expect(await mathRemote.add(2, 3)).is(5)
		expect(await mathRemote.mul(2, 3)).is(6)
	}),
})

