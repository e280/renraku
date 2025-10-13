
declare global {
	interface RenrakuSettings {
		transfer?: Transferable[]
	}
}

export type MessageLike<D = any> = {data: D, origin: string, source: MessageEvent["source"]}

export type MessageReceiver = {
	addEventListener(e: "message", listener: (event: MessageLike) => void): void
	removeEventListener(e: "message", listener: (event: MessageLike) => void): void
}

export type Messagable = {
	postMessage(m: any, transfer?: Transferable[]): void
} & MessageReceiver

/** @deprecated renamed to 'MessageLike' */
export type ChannelMessage<D = any> = MessageLike<D>

/** @deprecated renamed to 'MessageReceiver' */
export type Channel = MessageReceiver

/** @deprecated renamed to 'Messagable' */
export type PostableChannel = Messagable

