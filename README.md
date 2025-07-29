
# 連絡 <br/> ***R·E·N·R·A·K·U***

> ***"an api should just be a bunch of async functions, damn it!"***  
> &nbsp; &nbsp; — *Chase Moskal, many years ago*

📦 `npm install @e280/renraku`  
💡 elegantly expose async functions as an api  
🔌 http, websockets, postmessage, and more  
🚚 transport agnostic core  
🌐 node and browser  
🏛️ json-rpc 2.0  
🛡️ simple auth model  
🤖 foundation of web worker library [comrade](https://github.com/e280/comrade)  
💻 *an https://e280.org/ project*  

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

renraku websocket apis are *bidirectional,* meaning the serverside and clientside can call each other.. just be careful not to create a circular loop, lol.

and yes — a single renraku server can support an http rpc endpoint *and* a websocket api simultaneously.

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
- renraku has this concept of a `Tap`, which allows you to hook into renraku for logging purposes
- almost every renraku facility, can accept a `tap` — like `makeRemote`, `makeEndpoint`, etc
	- `ErrorTap` *(default)* — logs errors, but not every request
	- `LoggerTap` — *(default for `Server`)* verbose logging, all errors and every request
	- `DudTap` — silent, doesn't log anything

### error handling
- for security-by-default, when renraku encounters an error, it reports `unexposed error` to the client
	```ts
	const timingApi = {
		async now() {
			throw new Error("not enough minerals")
				//                   ☝️
				// secret message is hidden from remote clients
		},
	}
	```
- but you can throw an `ExposedError` when you want the error message sent to the client
	```ts
	import {ExposedError} from "@e280/renraku"

	const timingApi = {
		async now() {
			throw new ExposedError("insufficient vespene gas")
				//                        ☝️
				//             publicly visible message
		},
	}
	```
- any other kind of error will NOT send the message to the client
- the intention here is security-by-default, because error messages could potentially include sensitive information

### `secure` and `authorize` auth helpers
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
- `secure` and `authorize` do not support arbitrary nesting, so you have to pass them a flat object of async functions

### optimize fn calls

#### `tune` symbol
- all the functions on a renraku `Remote` can be 'tuned'
- import the symbol
	```ts
	import {tune} from "@e280/renraku"
	```
- imagine we have some renraku remote
	```ts
	await remote.sum(1, 2)
		// 3
	```
- `tune` a call with `notify`
	```ts
	await remote.sum[tune]({notify: true})(1, 2)
		// undefined
	```
	- this is how we do a json-rpc protocol 'notification' request, which do not generate any response
	- sometimes responses are not needed, thus this can be a nice little optimization
- `tune` a call with `transfer`
	```ts
	const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

	await remote.deliver[tune]({transfer: [buffer]})(buffer)
	```
	- this is how we specify [tranferables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) for fast zero-copy transfers between worker threads and such
	- important in sister project [comrade](https://github.com/e280/comrade) for threading workloads

#### `settings` symbol
- it's a set-and-forget way to pre-configure the default behavior for a remote fn
- import the symbol
	```ts
	import {settings} from "@e280/renraku"
	```
- `settings` to configure `notify` permanently on a fn
	```ts
	await remote.sum[settings].notify = true
	```
	now future calls will use `notify: true` (unless `tune` overrides)
	```ts
	await remote.sum(1, 2)
		// undefined
	```

<br/>

## ⛩️ *RENRAKU messenger and conduits*

`Messenger` is a bidirectional-capable api mediator, though it can also be used in a one-way capacity.

`Conduit` subclasses facilitate communications over various mediums:
- `BroadcastConduit` — for broadcast channel
- `PostableConduit` — for post message channels like web workers
- `WindowConduit` — for window post message channels
- `WebSocketConduit` — for low-level websockets (you should use `wsClient` helper instead)

the following examples will demonstrate using Messengers with WindowConduits for a common popup api example.

### one-way messenger, for calling fns on a popup
- we'll presume you make a `myPopup` via `window.open`
- create a messenger on the parent window (it sends requests)
	```ts
		//                               remote fns type
		//                                       👇
	const messenger = new Renraku.Messenger<MyPopupFns>({
		conduit: new Renraku.conduits.WindowConduit({
			localWindow: window,

			// who we're talking to (a popup we made via window.open)
			targetWindow: myPopup,

			targetOrigin: "https://example.e280.org",
			allow: e => e.origin === "https://example.e280.org",
		}),
	})

	// calling a popup fn
	await messenger.remote.sum(2, 3) // 5
	```
- create a messenger on the popup window (it sends responses)
	```ts
		//                             no remote fns
		//                                    👇
	const messenger = new Renraku.Messenger<{}>({
		conduit: new Renraku.conduits.WindowConduit({
			localWindow: window,

			// who we're talking to (the opener)
			targetWindow: window.opener,

			targetOrigin: "https://example.e280.org",
			allow: e => e.origin === "https://example.e280.org",
		}),

		getLocalEndpoint: (remote, rig) => (
			Renraku.makeEndpoint(myPopupFns)
				//                    ☝️
				//          exposed popup fns
		),
	})
	```

### two-way messenger, between a main window and a popup
- create a messenger on the opener window
	```ts
		//                          remote-side fns type
		//                                       👇
	const messenger = new Renraku.Messenger<MyPopupFns>({
		conduit: new Renraku.conduits.WindowConduit({
			localWindow: window,
			targetWindow: myPopup,
			targetOrigin: "https://example.e280.org",
			allow: e => e.origin === "https://example.e280.org",
		}),

			//                                   local-side fns
			//                                           👇
		getLocalEndpoint: (remote, rig) => endpoint(myOpenerFns),
	})

	// calling a popup fn
	await messenger.remote.sum(2, 3) // 5
	```
- create a messenger on the popup side, which will respond
	```ts
		//                               local-side fns type
		//                                           👇
	const messenger = new Renraku.Messenger<MyOpenerFns>({
		conduit: new Renraku.conduits.WindowConduit({
			localWindow: window,
			targetWindow: window.opener,
			targetOrigin: "https://example.e280.org",
			allow: e => e.origin === "https://example.e280.org",
		}),

		getLocalEndpoint: (remote, rig) => (
			Renraku.makeEndpoint(myPopupFns)
				//                    ☝️
				//            remote-side fns
		),
	})

	// calling an opener fn
	await messenger.remote.mul(2, 3) // 6
	```

<br/>

## ⛩️ *RENRAKU core primitives*

> [!NOTE]  
> TODO docs on this.  
> renraku provides a core toolkit of primitives like `makeEndpoint`, `makeRemote`, `makeMock`, `secute`, `authorize`...  
> these low-level functions help you implement new transport mediums, etc...  

<br/>

## ⛩️ *RENRAKU means contact*
💖 free and open source just for you  
🌟 reward us with github stars  
💻 join us at [e280](https://e280.org/) if you're a real one  

