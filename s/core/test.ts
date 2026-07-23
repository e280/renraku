
import {ok, gotErr, gotOk} from "@e280/stz"
import {science, test, expect} from "@e280/science"

import {makeRemote} from "./base/remote.js"
import {ExposedError} from "./base/errors.js"
import {makeEndpoint} from "./base/endpoint.js"

export default science.suite({
	"endpoint": {
		"call": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y)}
			const endpoint = makeEndpoint(fns)
			expect(gotOk(await endpoint([["add"], 1, 2]))).is(3)
		}),

		"not found": test(async() => {
			const endpoint = makeEndpoint({})
			expect(gotErr(await endpoint([["add"], 1, 2]))).is("not found")
		}),

		"error is masked for security": test(async() => {
			const fns = {hello: async() => { throw new Error("danger") }}
			const endpoint = makeEndpoint(fns)
			expect(gotErr(await endpoint([["hello"]]))).is("error")
		}),

		"exposed error is passed through": test(async() => {
			const fns = {hello: async() => { throw new ExposedError("safe error") }}
			const endpoint = makeEndpoint(fns)
			expect(gotErr(await endpoint([["hello"]]))).is("safe error")
		}),
	},

	"remote": {
		"call": test(async() => {
			type ExampleFns = {add(x: number, y: number): Promise<number>}
			const remote = makeRemote<ExampleFns>(async() => ok(3))
			expect(await remote.add(1, 2)).is(3)
		}),
	},

	"remote+endpoint": {
		"call fn": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y)}
			const endpoint = makeEndpoint(fns)
			const remote = makeRemote<typeof fns>(endpoint)
			expect(await remote.add(1, 2)).is(3)
		}),

		"call nested fn": test(async() => {
			const fns = {nested: {add: async(x: number, y: number) => (x + y)}}
			const endpoint = makeEndpoint(fns)
			const remote = makeRemote<typeof fns>(endpoint)
			expect(await remote.nested.add(1, 2)).is(3)
		}),

		"catch an error": test(async() => {
			const fns = {hello: async() => { throw new ExposedError("problem") }}
			const endpoint = makeEndpoint(fns)
			const remote = makeRemote<typeof fns>(endpoint)
			await expect(() => remote.hello()).throwsAsync()
			let caught: any
			try { await remote.hello() }
			catch (error) { caught = error }
			expect(caught?.message).is("problem")
		}),
	},
})

