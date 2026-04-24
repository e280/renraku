
export function gate(target: unknown, targetOrigin: string) {
	return (event: {source: unknown, origin: string}) => (
		event.source === target &&
		event.origin === targetOrigin
	)
}

/** good for sending to a window like an iframe.contentWindow or a popup */
export async function sendPortToOrigin(
		target: {postMessage(data: unknown, o: {targetOrigin: string, transfer: unknown[]}): void},
		targetOrigin: string,
	) {
	const {port1, port2} = new MessageChannel()
	target.postMessage("port", {targetOrigin, transfer: [port2]})
	return port1
}

/** good for sending to a worker or worker's parent */
export async function sendPort(
		target: {postMessage(data: unknown, o: {transfer: unknown[]}): void},
	) {
	const {port1, port2} = new MessageChannel()
	target.postMessage("port", {transfer: [port2]})
	return port1
}

export function acceptPorts(options: {
		allow: (event: MessageEvent) => boolean
		accept: (port: MessagePort) => void
	}) {
	const onmessage = (event: MessageEvent) => {
		if (options.allow(event) && event.data === "port") {
			options.accept(event.ports[0])
		}
	}
	globalThis.addEventListener("message", onmessage)
	return () => globalThis.removeEventListener("message", onmessage)
}

