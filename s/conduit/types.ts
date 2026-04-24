
import {Call, Ret} from "../parts/types.js"

export enum MsgKind {Call, Ret}
export type CallMsg = [kind: MsgKind.Call, id: number, call: Call]
export type RetMsg = [kind: MsgKind.Ret, id: number, ret: Ret]
export type Msg = CallMsg | RetMsg

