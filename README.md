
# 連絡 <br/> ***R·E·N·R·A·K·U***

> ***"an api should just be a bunch of async functions, damn it!"***  
> &nbsp; &nbsp; — *Chase Moskal, many years ago*

**renraku** is a magic typescript json-rpc library that makes life joyous again.  

📦 `npm install @e280/renraku`  
💡 async functions as api  
🔌 http, websockets, postmessage, anything  
↔️ fully stoked for bidirectionality  
🌐 node + browser  
🏛️ json-rpc 2.0  
🤖 for web workers, see [comrade](https://github.com/e280/comrade)  
💻 *an https://e280.org/ project*  

<br/>

## ⛩️ *RENRAKU http api*

1. 🍏 **your api is just async functions** — `rpc.ts`
    ```ts
    import Renraku from "@e280/renraku"

    export type MyFns = Awaited<ReturnType<typeof myRpc>>

    export const myRpc = Renraku.asRpc(async meta => ({
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
    - `meta.request` is the http node request object (with headers and stuff)
    - `meta.ip` is the ip address associated with the request
    - for input validation, you should use [zod](https://github.com/colinhacks/zod) or something
1. 🍏 **make an http server** — `server.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import {myRpc} from "./rpc.js"

    await new Renraku.Server({rpc: myRpc})
      .listen(8000)
    ```
    - your functions are served on a `POST /` json-rpc 2.0 endpoint
    - you get a free `GET /health` route that returns the current js timestamp
1. 🍏 **make a clientside remote** — `client.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import type {MyFns} from "./rpc.js"

    const remote = Renraku.httpRemote<MyFns>({url: "http://localhost:8000/"})
    ```
    🪄 now you can magically call the functions on the clientside
    ```ts
    await remote.now()
      // 1753780093703

    await remote.add(2, 2)
      // 4

    await remote.nesty.is.besty.mul(2, 3)
      // 6
    ```

> ### 👹 *roll your own: node http integration*
> if you're feeling spartan, you can produce an ordinary node http `RequestListener` for your rpc functions:
> ```ts
> import Renraku from "@e280/renraku"
> import * as http from "node:http"
> import {myRpc} from "./rpc.js"
>
> const requestListener = Renraku.makeRequestListener({rpc: myRpc})
>
> new http.Server(requestListener)
>   .listen(8000)
> ```

<br/>

## ⛩️ *RENRAKU websockets api*

renraku websocket apis are *bidirectional,* meaning the serverside and clientside can call each other.. just be careful not to create a circular loop, lol..

and yes — a single renraku server can support an http rpc endpoint *and* a websocket api simultaneously.

1. 🍏 **make your serverside** — `serverside.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import type {Clientside} from "./clientside.js"

    export type Serverside = {
      now(): Promise<number>
    }

    export const serverside = (
      Renraku.asAccepter<Serverside, Clientside>(async connection => {
        console.log("connected", connection.ip)
        return {
          fns: {
            async now() {
              // 🫨 omg we're calling the clientside from the serverside!
              await connection.remote.sum(1, 2)
              return Date.now()
            },
          },
          disconnected() {
            console.log("disconnected", connection.ip)
          },
        }
      })
    )
    ```
1. 🍏 **make your clientside** — `clientside.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import type {Serverside} from "./serverside.js"

    export type Clientside = {
      sum(a: number, b: number): Promise<number>
    }

    export const clientside = (
      Renraku.asConnector<Clientside, Serverside>(async connection => {
        console.log("connected")
        return {
          fns: {
            async sum(a: number, b: number) {
              return a + b
            },
          },
          disconnected() {
            console.log("disconnected")
          },
        }
      })
    )
    ```
1. 🍏 **run the websocket server** — `server.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import {serverside} from "./serverside.js"

    await new Renraku.Server({websocket: serverside})
      .listen(8000)
    ```
1. 🍏 **connect as a client** — `client.ts`
    ```ts
    import Renraku from "@e280/renraku"
    import {clientside} from "./clientside.js"

    const connection = await Renraku.wsConnect({
      connector: clientside,
      socket: new WebSocket("ws://localhost:8000/"),
    })

    // call the serverside functionality
    const result = await connection.remote.now()
      // 1753738662615

    // get the average ping time in milliseconds
    connection.rtt.average
      // 99

    // kill the connection
    connection.close()
    ```
1. 🍏 **the `connection` object has a bunch of good stuff**
    - all connection objects have this stuff:
      ```ts
      connection.socket // raw websocket instance

      connection.rtt.latest // latest known ping time in milliseconds
      connection.rtt.average // average of a handful of latest ping results
      connection.rtt.on(rtt => {}) // subscribe to individual ping results

      // remote for calling fns on the other side
      await connection.remote.sum(1, 2)

      // kill this connection
      connection.close()
      ```
    - serverside connections also have HttpMeta stuff:
      ```ts
      connection.ip // ip address of the client
      connection.request // http request with headers and such
      ```

> ### 👹 *roll your own: websocket upgrader integration*
> `WsIntegration` provides an `upgrader` that you can plug into a stock node http server:
> ```ts
> import Renraku from "@e280/renraku"
> import * as http from "node:http"
> import {serverside} from "./serverside.js"
>
> const server = new http.Server()
> const websockets = new Renraku.WsIntegration({accepter: serverside})
> server.on("upgrade", websockets.upgrader)
> ```

<br/>

## ⛩️ *RENRAKU gnarly details*

### 🍏 all `Renraku.Server` options
```ts
new Renraku.Server({

  // expose http json-rpc api
  rpc: async meta => ({
    async hello() { return "lol" },
  }),

  // expose websocket json-rpc api
  websocket: Renraku.asAccepter<Serverside, Clientside>(
    async connection => ({
      fns: {async hello() { return "lmao" }},
      disconnected() {},
    })
  ),

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

### 🍏 logging and error handling
- renraku has this concept of a `Tap`, which allows you to hook into renraku for logging purposes
- almost every renraku facility, can accept a `tap` — like `makeRemote`, `makeEndpoint`, etc
  - `ErrorTap` *(default)* — logs errors, but not every request
  - `LoggerTap` — *(default for `Server`)* verbose logging, all errors and every request
  - `DudTap` — silent, doesn't log anything

### 🍏 error handling
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

### 🍏 `secure` and `authorize` auth helpers
- use the `secure` function to section off parts of your api that require auth
  ```ts
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

  // 'secure' augments the functions to require the 'auth' param first
  await secured.sum("hello", 1, 2)
  ```
- use the `authorize` function on the clientside to provide the auth param upfront
  ```ts
  const authorized = Renraku.authorize(secured, async() => "hello")

  // now the auth is magically provided for each call
  await authorized.sum(1, 2)
  ```
  - but why an async getter function?  
    because it's a perfect opportunity for you to refresh tokens or what-have-you.  
    the getter is called for each api call.  
- `secure` and `authorize` do not support arbitrary nesting, so you have to pass them a flat object of async functions

### 🍏 optimize fn calls

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
  - this is how we do a json-rpc protocol 'notification' request, which skips the response (for fire-and-forget actions)
  - sometimes responses are not needed, so this can be a nice little optimization
- `tune` a call with `transfer`
  ```ts
  const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]).buffer

  await remote.deliver[tune]({transfer: [buffer]})(buffer)
  ```
  - this is how we specify [transferables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) for fast zero-copy transfers between worker threads and such
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
- [`BroadcastConduit`](./s/transports/messenger/conduits/broadcast.ts) — for broadcast channel
- [`PostableConduit`](./s/transports/messenger/conduits/postable.ts) — for post message channels like web workers
- [`WindowConduit`](./s/transports/messenger/conduits/window.ts) — for window post message channels
- [`WebsocketConduit`](./s/transports/messenger/conduits/websocket.ts) — used under the hood for websockets (but you should use `wsConnect` helper instead)

the following examples will demonstrate using Messengers with WindowConduits for a common popup api example.

### 🍏 incredible high-effort diagram
```
+----ALPHA----+      +----BRAVO----+
|             |      |             |
|  [Conduit]<==========>[Conduit]  |
|      |      |      |      |      |
| [Messenger] |      | [Messenger] |
|             |      |             |
+-------------+      +-------------+
```
- "alpha and bravo" could be a "clientside and serverside" or "window and popup" or whatever
- the point is, each side gets its own conduit and its own messenger
- the conduits are literally talking to each other
- the messenger's job is to deal with json-rpc and provide you with a callable `remote` and execute your local rpc endpoint

### 🍏 example — calling fns on a popup — one-way messenger
- `api.ts` — make a popup api
  ```ts
  import Renraku from "@e280/renraku"

  export const appOrigin = "https://example.e280.org"
  export type PopupFns = Awaited<ReturnType<typeof popupRpc>>

  export const popupRpc = Renraku.asMessengerRpc(async meta => ({
    async sum(a: number, b: number) {
      return a + b
    },
  }))
  ```
- `popup.ts` — in the popup, we create a messenger to expose our fns
  ```ts
  import Renraku from "@e280/renraku"
  import {popupRpc, appOrigin} from "./api.js"

  const messenger = new Renraku.Messenger({
    rpc: popupRpc,
    conduit: new Renraku.conduits.WindowConduit({
      localWindow: window,
      targetWindow: window.opener,
      targetOrigin: appOrigin,
      allow: e => e.origin === appOrigin,
    }),
  })
  ```
- `parent.ts` — in the parent window, we create a messenger to call our fns
  ```ts
  import Renraku from "@e280/renraku"
  import {PopupFns, appOrigin} from "./api.js"

  const popup = window.open(`${appOrigin}/popup`)

  const messenger = new Renraku.Messenger<PopupFns>({
    conduit: new Renraku.conduits.WindowConduit({
      localWindow: window,
      targetWindow: popup,
      targetOrigin: appOrigin,
      allow: e => e.origin === appOrigin,
    }),
  })
  ```
  now we can call the popup's fns:
  ```ts
  await messenger.remote.sum(2, 3)
    // 5
  ```

### 🍏 example — bidirectional parent and popup calls — two-way messenger
- `api.ts` — make both apis
  ```ts
  import Renraku from "@e280/renraku"

  export const appOrigin = "https://example.e280.org"
  export type PopupFns = {sum(a: number, b: number): Promise<number>}
  export type ParentFns = {mul(a: number, b: number): Promise<number>}

  export const popupRpc = Renraku.asMessengerRpc<PopupFns, ParentFns>(async meta => ({
    async sum(a, b) {
      await meta.remote.mul(2, 3) // 🧐 yes, we can call the other side
      return a + b
    },
  }))

  export const parentRpc = Renraku.asMessengerRpc<ParentFns, PopupFns>(async meta => ({
    async mul(a, b) {
      return a * b
    },
  }))
  ```
- `popup.ts` — popup window side
  ```ts
  import Renraku from "@e280/renraku"
  import {appOrigin, popupRpc} from "./api.js"

  const messenger = new Renraku.Messenger({
    rpc: popupRpc,
    conduit: new Renraku.conduits.WindowConduit({
      localWindow: window,
      targetWindow: window.opener,
      targetOrigin: appOrigin,
      allow: e => e.origin === appOrigin,
    }),
  })
  ```
  now the popup can call parent fns
  ```ts
  await messenger.remote.mul(2, 3)
    // 6
  ```
- `parent.ts` — parent window side
  ```ts
  import Renraku from "@e280/renraku"
  import {appOrigin, parentRpc} from "./api.js"

  const popup = window.open(`${appOrigin}/popup`)

  const messenger = new Renraku.Messenger({
    rpc: parentRpc,
    conduit: new Renraku.conduits.WindowConduit({
      localWindow: window,
      targetWindow: popup,
      targetOrigin: appOrigin,
      allow: e => e.origin === appOrigin,
    }),
  })
  ```
  now the parent can call popup fns
  ```ts
  await messenger.remote.sum(2, 3)
    // 5
  ```

### 🍏 messenger zero-copy transferables

`Messenger` is often used across postMessage boundaries, to talk to popups, iframes, or web workers.

as such, you can set `meta.transfer` array, so you can return [transferables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects):
```ts
export const popupRpc = Renraku.asMessengerRpc(async meta => ({
  async getData() {
    const bytes = new Uint8Array([0xB0, 0x0B, 0x1E, 0x5]).buffer
    meta.transfer = [bytes]
    return bytes // ⚡ transferred speedy-fastly
  },
}))
```

<br/>

## ⛩️ *RENRAKU core primitives*
- *TODO* lol we should write more in depth docs about the core tools here
- [`makeEndpoint(~)`](./s/core/endpoint.ts) — make a json-rpc endpoint fn for a group of async fns
- [`makeRemote(~)`](./s/core/remote.ts) — make a nested proxy tree of invokable fns, given an endpoint
- [`makeMock(~)`](./s/core/mock.ts) — sugar for making an endpoint and then a remote for the given fns
- [`JsonRpc`](./s/core/json-rpc.ts) — namespace of json rpc types and helpers
- [`fns(~)`](./s/core/types.ts) — typescript identity helper for a group of async fns
- [`types.ts`](./s/core/types.ts) — typescript identity helper for a group of async fns
  - `AsFns<X>` — ensures `X` is a group of valid async functions
  - `Remote<MyFns>` — adds the magic `tune` stuff to the provided `MyFns` types

<br/>

## ⛩️ *RENRAKU means contact*
💖 free and open source just for you  
🌟 reward us with github stars  
💻 join us at [e280](https://e280.org/) if you're a real one  

