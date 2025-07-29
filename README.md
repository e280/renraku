
# 連絡 <br/> ***R·E·N·R·A·K·U***

> ***"an api should just be a bunch of async functions, damn it!"***  
> &nbsp; &nbsp; — *Chase Moskal, many years ago*

📦 `npm install @e280/renraku`  
💡 elegantly expose async functions as an api  
🔌 http, websockets, postmessage, and more  
🚚 transport agnostic core  
🌐 node and browser  
🏛️ json-rpc 2.0  
🛡️ handy little auth helpers  
💻 *an https://e280.org/ project*  

i've been using and sharpening this typescript implementation for many years.

<br/>

## ⛩️ *RENRAKU http api*

1. 🍏 **your api is just async functions** — `rpc.ts`
	```ts
	import Renraku from "@e280/renraku"

	export type MyFns = ReturnType<typeof rpc>

	export const rpc = Renraku.asHttpRpc(({request, ip}) => ({
		async now() {
			return Date.now()
		},

		async add(a: number, b: number) {
			return a + b
		},

		nesty: {
			is: {
				besty: {
					async mul(a: number, b: number) {
						return a * b
					},
				},
			},
		},
	}))
	```
	- for input validation, you should use [zod](https://github.com/colinhacks/zod) or something
1. 🍏 **make an http server** — `server.ts`
	```ts
	import Renraku from "@e280/renraku"
	import {rpc} from "./rpc.js"

	await new Renraku.Server({rpc})
		.listen(8000)
	```
	- your functions are served on a `POST /` json-rpc 2.0 endpoint
	- `GET /health` route that returns the current js timestamp
1. 🍏 **make a clientside remote** — `client.ts`
	```ts
	import Renraku from "@e280/renraku"
	import type {MyFns} from "./rpc.js"

	const remote = Renraku.httpRemote<MyFns>({
		url: "http://localhost:8000/",
	})
	```
	🪄 now you can magically call the functions on the clientside
	```ts
	await remote.now()
		// 1723701145176

	await remote.add(2, 2)
		// 4

	await remote.nesty.is.besty.mul(2, 3)
		// 6
	```

<br/>

## ⛩️ *RENRAKU websockets api*

renraku websocket apis are *bidirectional,* meaning the serverside and clientside can call each other.

just be careful not to create a circular loop, lol.

and yes — a single Renraku.Server can support an http rpc endpoint *and* a websocket api simultaneously.

1. 🍏 **formalize your serverside and clientside api types** — `types.ts`  
	(these explicit types are needed so typescript doesn't get confused about circularities)
	```ts
	export type Serverside = {
		now(): Promise<number>
	}

	export type Clientside = {
		sum(a: number, b: number): Promise<number>
	}
	```
1. 🍏 **implement your serverside and clientside fns** (they can call each other!) — `rpcs.ts`
	```ts
	import Renraku from "@e280/renraku"
	import type {Clientside, Serverside} from "./types.js"

	export const serversideRpc = (
		Renraku.asWsRpc<Serverside, Clientside>(clientside => ({
			async now() {
				await clientside.sum(1, 2)
				return Date.now()
			},
		}))
	)

	export const clientsideRpc = (
		Renraku.asWsRpc<Clientside, Serverside>(serverside => ({
			async sum(a: number, b: number) {
				return a + b
			},
		}))
	)
	```
1. 🍏 **make a websocket server** — `server.ts`
	```ts
	import Renraku from "@e280/renraku"
	import {serversideRpc} from "./rpcs.js"
	import type {Clientside} from "./types.js"

	await new Renraku.Server({
		websocket: Renraku.websocket<Clientside>(_connection => ({
			rpc: serversideRpc,
			disconnected: () => {},
		})),
	}).listen(8000)
	```
	- the `connection` object has a bunch of good stuff
		```ts
		connection.ip // ip address of the client
		connection.request // http request with headers and such
		connection.socket // raw websocket instance

		connection.rtt.latest // latest known ping time in milliseconds
		connection.rtt.average // average of a handful of latest ping results
		connection.rtt.on(rtt => {}) // subscribe to individual ping results

		// remote for calling clientside fns
		connection.remote.sum(1, 2)
			.then(result => console.log(result))

		// kill this connection
		connection.close()
		```
1. 🍏 **connect as a client** — `client.ts`
	```ts
	import Renraku from "@e280/renraku"
	import {clientsideRpc} from "./rpcs.js"
	import type {Serverside} from "./types.js"

	const client = await Renraku.wsClient<Serverside>({
		rpc: clientsideRpc,
		socket: new WebSocket("ws://localhost:8000/"),
		disconnected: () => console.error("disconnected"),
	})

	// call the serverside functionality
	const result = await client.remote.now()
		// 1753738662615

	// get the average ping time
	client.rtt.average
		// 99

	// kill the connection
	client.close()
	```

<br/>

## ⛩️ *RENRAKU more details*

### all `Renraku.Server` options
```ts
import Renraku from "@e280/renraku"

const server = new Renraku.Server({

	// expose http json-rpc api
	rpc: ({request, ip}) => ({
		hello: async() => "world",
	}),

	// expose websocket json-rpc api
	websocket: Renraku.websocket<Clientside>(connection => ({
		rpc: clientside => ({
			hello: async() => "world",
		}),
		disconnected: () => {},
	})),

	// supply a logger to get verbose console output (only logs errors by default)
	tap: new Renraku.LoggerTap(),

	// allow cross-origin requests (cors is disabled by default)
	cors: {origins: "*"},
	
	// request timeout in milliseconds (defaults to 60_000)
	timeout: 60_000,

	// requests with bodies bigger than this number are rejected (10 MB default)
	maxRequestBytes: 10_000_000,

	// specify the url of the rpc endpoint (defaults to `/`)
	rpcRoute: "/",

	// specify the url of the health endpoint (defaults to `/health`)
	healthRoute: "/health",

	// provide a transmuter that modifies incoming requests before routing
	transmuters: [],

	// you can provide custom listeners for additional http routes..
	routes: [
		Renraku.route.get("/hello", Renraku.respond.text("hello world")),
	],
})
```

### logging and error handling
- by default, renraku will log all errors to the console
- renraku is secure-by-default, and when reporting errors over json-rpc, erorrs will be obscured as `unexposed error`
	- however, you can throw a renraku `ExposedError` and the error message *will* be sent down the json-rpc wire
- renraku has this concept of a `Tap`, which allows you to hook into renraku for logging purposes
	- almost every renraku facility, can accept a `tap` — like `remote`, `endpoint`, `httpServer`, etc
	- `ErrorTap` *(default)* — logs errors, but not every request
	- `LoggerTap` — verbose logging, all errors and every request
	- `DudTap` — silent, doesn't log anything
- in particular, the `httpServer` and `webSocketServer` use a verbose `LoggerTap`, all other facilities default to the `ErrorTap`

### `secure` and `authorize` auth helpers
- `secure` and `authorize` do not support arbitrary nesting, so you have to pass them a flat object of async functions
- use the `secure` function to section off parts of your api that require auth
	```ts
	import Renraku from "@e280/renraku"

	// auth param can be any type you want
	const secured = Renraku.secure(async(auth: string) => {

		// here you can do any auth work you need
		if (auth !== "hello")
			throw new Error("auth error: did not receive warm greeting")

		return {
			async sum(a: number, b: number) {
				return a + b
			},
		}
	})

	// 'secure' augments the functons to require the 'auth' param first
	await secured.sum("hello", 1, 2)
	```
- use the `authorize` function on the clientside to provide the auth param upfront
	```ts
	import Renraku from "@e280/renraku"

	const authorized = Renraku.authorize(secured, async() => "hello")
		// it's an async function so you could refresh tokens or whatever

	// now the auth is magically provided for each call
	await authorized.sum(1, 2)
	```
	- but why an async getter function?  
		ah, well that's because it's a perfect opportunity for you to refresh your tokens or what-have-you.  
		the getter is called for each api call.  

<br/>

## ⛩️ *RENRAKU bidirectional messenger conduits*

> [!NOTE]  
> TODO docs on this.  
> the `Messenger` and `conduits` are how to setup various apis across mediums like iframe postMessages, broadcast channels, web workers, etc...  

<br/>

## ⛩️ *RENRAKU core primitives*

> [!NOTE]  
> TODO docs on this.  
> renraku provide a core toolkit of primitives like `makeEndpoint`, `makeRemote`, `makeMock`, `secute`, `authorize`...  
> these low-level functions help you implement new transport mediums, etc...  

<br/>

## ⛩️ *RENRAKU means contact*
💖 free and open source just for you  
🌟 reward us with github stars  
💻 join us at [e280](https://e280.org/) if you're a real one  

