
# 連絡 <br/> ***R·E·N·R·A·K·U***

> ***"an api should just be a bunch of async functions, damn it!"***  
> &nbsp; &nbsp; — *Chase Moskal, many years ago*

📦 `npm install @e280/renraku`
💡 elegantly expose async functions as an api  
🔌 http, websockets, postmessage, and more  
🏛️ json-rpc 2.0  
🌐 node and browser  
🚚 transport agnostic toolkit  
🛡️ handy little auth helpers  
💻 *an https://e280.org/ project*  

i've been using and sharpening this typescript implementation for many years.

<br/>

## ⛩️ *RENRAKU* http

1. `rpc.ts` — **your api is just async functions**
	```ts
	import {asHttpRpc} from "@e280/renraku"

	export const rpc = asHttpRpc(({request, ip}) => ({
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
1. `server.ts` — **make an http server**
	```ts
	import {RenrakuServer, LoggerTap} from "@e280/renraku"
	import {rpc} from "./rpc.js"

	await new RenrakuServer({rpc})
		.listen({port: 8000})
	```
	- your functions are served on a `POST /` json-rpc 2.0 endpoint
	- `GET /health` route that returns the current js timestamp
1. `client.ts` — **make a clientside remote**
	```ts
	import {httpRemote} from "@e280/renraku"
	import type {rpc} from "./rpc.js"
		//		↑
		// we actually only need the *type* here

	type RpcFns = ReturnType<typeof rpc>
	const url = "http://localhost:8000/"

	const remote = httpRemote<RpcFns>({url})
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

### more RenrakuServer options

```ts
import {LoggerTap, route, respond} from "@e280/renraku"

const server = new RenrakuServer({

	// expose functionality as json-rpc api
	rpc: ({request, ip}) => ({
		hello: async() => "world",
	}),

	// setup a websocket api (documented later in readme)
	websocket: undefined,

	// supply a logger to get verbose console output (only logs errors by default)
	tap: new LoggerTap(),

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

	// provide a trasmuter that modifies incoming requests before routing
	transmuters: [],

	// you can provide custom listeners for additional http routes..
	routes: [
		route.get("/hello", respond.text("hello world")),
	],
})
```

<br/>

## ⛩️ *RENRAKU* websockets

renraku websocket apis are *bidirectional,* meaning the serverside and clientside can call each other.

just be careful not to create a circular loop, lol.

and yes — a single RenrakuServer can support an http rpc endpoint *and* a websocket api simultaneously.

1. `types.ts` — **formalize your serverside and clientside api types**  
	(these explicit types are needed so typescript doesn't get confused about circularities)
	```ts
	export type Serverside = {
		now(): Promise<number>
	}

	export type Clientside = {
		sum(a: number, b: number): Promise<number>
	}
	```
1. `rpcs.ts` — **implement your serverside and clientside fns** (they can call each other!)
	```ts
	import {asWsRpc} from "@e280/renraku"
	import type {Clientside, Serverside} from "./types.js"

	export const serversideRpc = asWsRpc<Serverside, Clientside>(clientside => ({
		async now() {
			await clientside.sum(1, 2)
			return Date.now()
		},
	}))

	export const clientsideRpc = asWsRpc<Clientside, Serverside>(_serverside => ({
		async sum(a: number, b: number) {
			return a + b
		},
	}))
	```
1. `server.ts` — **make a websocket server**
	```ts
	import {RenrakuServer} from "@e280/renraku"
	import {serversideRpc} from "./rpcs.js"
	import type {Clientside} from "./types.js"

	await new RenrakuServer({
		websocket: RenrakuServer.websocket<Clientside>(_connection => ({
			rpc: exampleWsServersideRpc,
			disconnected: () => {},
		})),
	}).listen({port: 8000})
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
1. `client.ts` — **connect as a client**
	```ts
	import {wsClient} from "@e280/renraku"
	import {serversideRpc} from "./rpcs.js"
	import type {Serverside} from "./types.js"

	const client = await wsClient<Serverside>({
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

