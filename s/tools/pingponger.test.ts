
import {DeadlineError, nap} from "@e280/stz"
import {Science, test, expect, spy} from "@e280/science"
import {Pingponger} from "./pingponger.js"

export default Science.suite({
	"ping returns promise that resolves on pong": test(async() => {
		let capturedId: number | undefined
		const pingponger = new Pingponger({
			timeout: 100,
			send: p => {capturedId = p[1]},
		})
		let resolved: undefined | {rtt: number}
		pingponger.ping().then(rtt => resolved = {rtt})
		if (capturedId === undefined) throw new Error()
		pingponger.recv(["pong", capturedId])
		await nap(0)
		expect(resolved).ok()
	}),

	"ping throws when timeout exceeded": test(async() => {
		const pingponger = new Pingponger({timeout: 100, send: () => {}})
		await expect(async() => Promise.race([
			pingponger.ping(),
			nap(200),
		])).throwsAsync()
	}),

	"heartbeat": test(async() => {
		let circulation = true
		let beats = 0
		const onTimeout = spy((_error: any) => {})
		const pingponger = new Pingponger({
			timeout: 100,
			send: ([,id]) => nap(10).then(() => {
				if (circulation) {
					beats++
					pingponger.recv(["pong", id])
				}
			}),
		})

		// start the heartbeat, wait a bit, see that we get beats
		const stop = pingponger.heartbeat(onTimeout)
		await nap(300)
		expect(beats).gte(3)

		// now we cut the circulation, onTimeout should have been called
		circulation = false
		await nap(200)
		expect(onTimeout.spy.calls.length).is(1)
		expect(onTimeout.spy.calls[0].args[0] instanceof DeadlineError).ok()

		// cleanup heartbeat so we don't screw up other tests
		stop()
	}),
})

