
export function gatekeep(target: MessageEventSource, targetOrigin: string) {
	return (event: MessageEvent) => (
		event.source === target &&
		event.origin === targetOrigin
	)
}

