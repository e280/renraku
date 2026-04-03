
import {Result} from "@e280/stz"

export type Fn = (...args: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export const asFns = <F extends Fns>(fns: F) => fns

export type Call = [method: string[], ...params: any[]]
export type Ret = Result<any, string>

export type Endpoint = (call: Call) => Promise<Ret>

