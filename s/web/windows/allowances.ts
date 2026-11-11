
export function allowOrigins(...origins: string[]) {
	return (event: MessageEvent) => {
		if (origins.includes(event.origin)) {
			return true
		}
		else {
			console.warn(`bad message origin "${event.origin}"`)
			return false
		}
	}
}

