
import {Port} from "../types.js"
import {acceptKind, offerKind} from "./utils/kinds.js"

export type Send<X> = (data: X, transfer: any[]) => void
export type Recv = (fn: (data: any) => void) => (() => void)

export type Offer = {kind: typeof offerKind, id: string, port: Port}
export type Accept = {kind: typeof acceptKind, id: string}

