
import {Tap, TapContext} from "../types.js"

export function bindTap(tap: Tap, ctx: TapContext): Tap {
	return {
		error: o => tap.error({...ctx, ...o}),
		rpcRequest: o => tap.rpcRequest({...ctx, ...o}),
		rpcError: o => tap.rpcError({...ctx, ...o}),
	}
}

