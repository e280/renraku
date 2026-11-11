
import {isObject, isString} from "@e280/stz"
import {Accept, Offer} from "../types.js"
import {acceptKind, offerKind} from "./kinds.js"

export function isOffer(data: any): data is Offer {
	return (
		isObject(data)
			&& data.kind === offerKind
			&& isString(data.id)
			&& isObject(data.port)
	)
}

export function isAccept(data: any, id: string): data is Accept {
	return (
		isObject(data)
			&& data.kind === acceptKind
			&& isString(data.id)
			&& data.id === id
	)
}

