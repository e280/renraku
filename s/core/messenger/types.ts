
import {Call, Ret} from "../base/types.js"

export enum MessageKind {Request, Response}
export type Request = [kind: MessageKind.Request, id: number, call: Call]
export type Response = [kind: MessageKind.Response, id: number, ret: Ret]
export type Message = Request | Response

