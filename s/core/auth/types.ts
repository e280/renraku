
import {Fn, Service} from "../types.js"

export type AuthFn<A> = (a: A, ...p: any[]) => Promise<any>
export type AuthFns<A> = Record<string, AuthFn<A>>

export type FirstParams<F extends Fn> = (
	F extends ((first: infer First, ...a: any[]) => Promise<any>)
		? First
		: never
)

export type OtherParams<F extends Fn> = (
	F extends ((first: any, ...a: infer Others) => Promise<any>)
		? Others
		: never
)

export type Secure<A, S extends Service> = {
	[K in keyof S]:
		(auth: A, ...params: Parameters<S[K]>) => ReturnType<S[K]>
}

export type Authorize<S extends Service> = {
	[K in keyof S]:
		(...p: OtherParams<S[K]>) => ReturnType<S[K]>
}

