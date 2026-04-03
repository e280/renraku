
import {need} from "@e280/stz"
import {science, test, expect} from "@e280/science"
import {makeEndpoint} from "./parts/endpoint.js"

await science.run({
	"endpoint": test(async() => {
		const endpoint = makeEndpoint({
			async add(a: number, b: number) {
				return a + b
			},
		})
		expect(need(await endpoint([["add"], [1, 2]]))).is(3)
	}),
})

