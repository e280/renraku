
import {ok, gotErr, gotOk} from "@e280/stz"
import {science, test, expect} from "@e280/science"

import {makeRemote} from "./base/remote.js"
import {ExposedError} from "./base/errors.js"
import {makeEndpoint} from "./base/endpoint.js"
import {unexposedErrorMessage} from "../consts.js"

export default science.suite({
	"endpoint": {
		"call": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y)}
			const endpoint = makeEndpoint(fns)
			expect(gotOk(await endpoint([["add"], 1, 2]))).is(3)
		}),

		"not found": test(async() => {
			const endpoint = makeEndpoint({})
			expect(gotErr(await endpoint([["add"], 1, 2]))).ok()
		}),

		"not found deep": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y), sub: {}}
			const endpoint = makeEndpoint(fns)
			expect(gotErr(await endpoint([["add", "lol"], 1, 2]))).ok()
			expect(gotErr(await endpoint([["sub"], 1, 2]))).ok()
			expect(gotErr(await endpoint([["sub", "lol"], 1, 2]))).ok()
		}),

		"error is concealed for security": test(async() => {
			const fns = {hello: async() => { throw new Error("danger") }}
			const endpoint = makeEndpoint(fns)
			expect(gotErr(await endpoint([["hello"]]))).is(unexposedErrorMessage)
		}),

		"exposed error is passed through": test(async() => {
			const fns = {hello: async() => { throw new ExposedError("safe error") }}
			const endpoint = makeEndpoint(fns)
			expect(gotErr(await endpoint([["hello"]]))).is("ExposedError: safe error")
		}),

		"cannot crawl naughty properties": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y)}
			const endpoint = makeEndpoint(fns)
			for (const key of ["toString", "__proto__", "constructor"]) {
				expect(gotErr(await endpoint([[key]]))).ok()
				expect(gotErr(await endpoint([["add", key]]))).ok()
			}
		}),

		"cannot call inherited methods": test(async() => {
			const fns = Object.assign(
				Object.create({
					secret: async() => "oops",
				}),
				{add: async() => 3},
			)
			const endpoint = makeEndpoint(fns)
			expect(gotOk(await endpoint([["add"]]))).is(3)
			expect(gotErr(await endpoint([["secret"]]))).ok()
		}),

		"preserve 'this'": test(async() => {
			const fns = {
				async hello() {
					return "world"
				},
				async alias() {
					return this.hello()
				},
			}
			const endpoint = makeEndpoint(fns)
			expect(gotOk(await endpoint([["alias"]]))).is("world")
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
			expect(caught?.message).is("ExposedError: problem")
		}),

		"the circle of life": test(async() => {
			const fns = {add: async(x: number, y: number) => (x + y)}
			const endpoint = makeEndpoint(fns)
			const remote = makeRemote<typeof fns>(endpoint)

			const endpoint2 = makeEndpoint(remote)
			const remote2 = makeRemote<typeof fns>(endpoint2)
			expect(await remote2.add(1, 2)).is(3)
		}),
	},
})

