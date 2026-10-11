
import type {Result} from "@e280/stz"

export type Fn = (...args: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export const asFns = <F extends Fns>(fns: F) => fns

export type Ret<Value = any> = Result<Value, string>

export type Call = [path: string[], ...params: any[]]
export type Endpoint = (call: Call) => Promise<Ret>

