
import {nap} from "@e280/stz"
import {Science, test, expect} from "@e280/science"
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
})

