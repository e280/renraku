
import {Result} from "@e280/stz"

export type Fn = (...args: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export const asFns = <F extends Fns>(fns: F) => fns

export type Call = [path: string[], ...params: any[]]
export type Ret = Result<any, string>
export type Endpoint = (call: Call) => Promise<Ret>

export type Remote<F extends Fns> = {
	[K in keyof F]: (
		F[K] extends Fns
			? Remote<F[K]>
			: F[K]
	)
}

