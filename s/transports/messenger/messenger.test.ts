
import {suite, test, expect} from "@e280/science"
import {Messenger} from "./messenger.js"
import {Conduit} from "./conduits/conduit.js"
import {setupSide} from "./testing/setup-side.js"

export const messenger = suite({
	"two messengers can call each other": test(async() => {
		const [conduitA, conduitB] = Conduit.makeEntangledPair()
		const alice = setupSide(conduitA)
		const bob = setupSide(conduitB)

		// alice's remote calls bob's fn
		await alice.messenger.remote.add(2, 3)
		expect(bob.calls.add.length)
			.note("bob's fn wasn't called")
			.is(1)

		// bob's remote calls alice's fn
		await bob.messenger.remote.mul(2, 3)
		expect(alice.calls.mul.length)
			.note("alice's fn wasn't called")
			.is(1)
	}),

	"messenger meta.remote calls work": test(async() => {
		type AlphaFns = {alpha(): Promise<void>}
		type BravoFns = {bravo(): Promise<void>}
		const [conduitA, conduitB] = Conduit.makeEntangledPair()
		let alphaCalls = 0
		let bravoCalls = 0

		const alphaMessenger = new Messenger<AlphaFns, BravoFns>({
			conduit: conduitA,
			rpc: async meta => ({
				async alpha() {
					alphaCalls++
					await meta.remote.bravo()
				},
			}),
		})

		const bravoMessenger = new Messenger<BravoFns, AlphaFns>({
			conduit: conduitB,
			rpc: async() => ({
				async bravo() {
					bravoCalls++
				},
			}),
		})

		expect(alphaCalls).is(0)
		expect(bravoCalls).is(0)
		await bravoMessenger.remote.alpha()
		expect(alphaCalls).is(1)
		expect(bravoCalls).is(1)
		void alphaMessenger
	}),
})

