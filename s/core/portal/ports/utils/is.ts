
import {is} from "@e280/stz"
import {Accept, Offer} from "../types.js"
import {acceptKind, offerKind} from "./kinds.js"

export function isOffer(data: any): data is Offer {
	return (
		is.object(data)
			&& data.kind === offerKind
			&& is.string(data.id)
			&& is.object(data.port)
	)
}

export function isAccept(data: any, id: string): data is Accept {
	return (
		is.object(data)
			&& data.kind === acceptKind
			&& is.string(data.id)
			&& data.id === id
	)
}

