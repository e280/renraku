
import {fns} from "../../../core/types.js"
import {secure} from "../../../core/auth/secure.js"

export const example = fns({

	// unauthenticated service
	unlocked: {
		async sum(a: number, b: number) {
			return a + b
		},
	},

	// authenticated service
	locked: secure(async(auth: string) => {

		if (auth !== "hello")
			throw new Error("invalid auth")

		return {
			async now() {
				return Date.now()
			},
		}
	}),
})

