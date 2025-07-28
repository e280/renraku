
# 連絡 <br/> ***R·E·N·R·A·K·U***

### 🎨 make beautiful typescript apis

📦 **`npm i renraku`**  
💡 elegantly expose async functions as an api  
🌐 node and browser  
🏛️ json-rpc 2.0  
🔌 http, websockets, and more  
🚚 super transport agnostic  
🛡️ handy little auth helpers  

<br/>

### a simple idea

> ***"an api should just be a bunch of async functions, damn it"***  
> &nbsp; — *Chase Moskal, many years ago*

*renraku* is my project to realize this dream, and i've been evolving this typescript implementation for many years.

i keep finding ways to make it more elegant, more terse, and more flexible.. renraku might be near its penultimate form.. the server and client are basically one-liners now.

renraku doesn't do input validation, you might want to use [zod](https://github.com/colinhacks/zod) for that.

<br/>

## ⛩️ *RENRAKU* — it's really this easy
1. install renraku into your project
    ```sh
    npm i renraku
    ```
1. `example.ts` — your bunch of async functions
    ```ts
    export const exampleFns = {

      async now() {
        return Date.now()
      },

      async sum(a: number, b: number) {
        return a + b
      },

      // arbitrary nesting is cool
      nested: {
        async multiply(a: number, b: number) {
          return a * b
        },
      },
    }
    ```
1. `server.ts` — expose them on a server
    ```ts
    import {exampleFns} from "./example.js"
    import {endpoint} from "renraku"
    import {HttpServer} from "renraku/node"
      //                               ↑
      // serverside/clientside stuff are cleanly separated

    new HttpServer(() => endpoint(exampleFns)).listen(8000)
    ```
1. `client.ts` — make a clientside remote to call them
    ```ts
    import {httpRemote} from "renraku"
    import type {exampleFns} from "./example.js"
      //    ↑
      // we actually only need the *type* here

    const example = httpRemote<typeof exampleFns>("http://localhost:8000/")

    // 🪄 you can now call the functions

    await example.now()
      // 1723701145176

    await example.sum(1, 2)
      // 3

    await example.nested.multiply(2, 2)
      // 4
    ```

### http headers etc
- renraku will provide the http stuff you need
  ```ts
    //              🆒  🆒    🆒
    //              ↓   ↓     ↓
  new HttpServer(({req, ip, headers}) => endpoint({

    async sum(a: number, b: number) {
      console.log(ip, headers["origin"])
      return a + b
    },
  })).listen(8000)
  ```

<br/>

## ⛩ *RENRAKU* — new `Messenger` for post message and more

renraku v0.5 introduces this new `Messenger` class, which will eventually unify more of renraku's systems.

messenger is capable of one-way or two-way communication over any kind of communication `Conduit`.

messenger also implements [Transferables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects), so we can efficiently transfer large binary things across local postmessage boundaries like web workers (if you're interested in web workers, see [@e280/comrade](https://github.com/e280/comrade) which makes it easy for you).

### one-way messenger for calling fns on a popup
- create a messenger on the parent window (it sends requests)
  ```ts
  import Renraku from "renraku"

    //                                 remote fns type
    //                                        👇
  const messenger = new Renraku.Messenger<MyPopupFns>({
    conduit: new Renraku.conduits.WindowConduit(

      // who we're talking to (a popup we made via window.open)
      myPopup,

      // origin we're sending to
      "https://example.e280.org",
    ),
  })

  // calling a popup fn
  await messenger.remote.math.add(2, 3) // 5
  ```
- create a messenger on the popup window (it sends responses)
  ```ts
  import Renraku from "renraku"

    //                           no remote fns
    //                                    👇
  const messenger = new Renraku.Messenger<{}>({
    conduit: new Renraku.conduits.WindowConduit(

      // who we're talking to (the opener)
      window.opener,

      // origin we're sending to
      "https://example.e280.org",

      // only listen to messages from correct origin
      e => e.origin === "https://example.e280.org",
    ),

      //                                 exposed popup fns
      //                                           👇
    getLocalEndpoint: (remote, rig) => endpoint(myPopupFns),
  })
  ```

### two-way messenger
- create a messenger on the opener window
  ```ts
  import Renraku from "renraku"

    //                            remote-side fns type
    //                                         👇
  const messenger = new Renraku.Messenger<MyPopupFns>({
    conduit: new Renraku.conduits.WindowConduit(
      myPopup,
      "https://example.e280.org",
    ),

      //                                     local-side fns
      //                                            👇
    getLocalEndpoint: (remote, rig) => endpoint(myOpenerFns),
  })

  // calling a popup fn
  await messenger.remote.popup.add(2, 3) // 5
  ```
- create a messenger on the popup side, which will respond
  ```ts
  import Renraku from "renraku"

    //                              local-side fns type
    //                                         👇
  const messenger = new Renraku.Messenger<MyOpenerFns>({
    conduit: new Renraku.conduits.WindowConduit(

      // who we're talking to (the opener)
      window.opener,

      // origin we're sending to
      "https://example.e280.org",

      // only listen to messages from correct origin
      e => e.origin === "https://example.e280.org",
    ),

      //                                   remote-side fns
      //                                            👇
    getLocalEndpoint: (remote, rig) => endpoint(myPopupFns),
  })

  // calling an opener fn
  await messenger.remote.opener.mul(2, 3) // 6
  ```

<br/>

## ⛩ *RENRAKU* — auth with `secure` and `authorize`
- ⛔ right now `secure` and `authorize` do not support arbitrary nesting, so you have to pass in a flat object of async functions.
- use the `secure` function to section off parts of your api that require auth
  ```ts
  import {secure} from "renraku"

  export const exampleFns = {

      // declaring this area requires auth
      //    |
      //    |   auth can be any type you want
      //    ↓                  ↓
    math: secure(async(auth: string) => {

      // here you can do any auth work you need
      if (auth !== "hello")
        throw new Error("auth error: did not receive warm greeting")

      return {
        async sum(a: number, b: number) {
          return a + b
        },
      }
    }),
  }
  ```
  - you see, `secure` merely adds your initial auth parameter as a required argument to each function
    ```ts
      //                  auth param
      //                      ↓
    await example.math.sum("hello", 1, 2)
    ```
- use the `authorize` function on the clientside to provide the auth param upfront
  ```ts
  import {authorize} from "renraku"

    //             (the secured area)  (async getter for auth param)
    //                          ↓              ↓
  const math = authorize(example.math, async() => "hello")
    // it's an async function so you could refresh
    // tokens or whatever

  // now the auth is magically provided for each call
  await math.sum(1, 2)
  ```
  - but why an async getter function?  
    ah, well that's because it's a perfect opportunity for you to refresh your tokens or what-have-you.  
    the getter is called for each api call.  

<br/>

## ⛩ *RENRAKU* — whimsical websockets
- here our example websocket setup is more complex because we're setting up two apis that can communicate bidirectionally.
- define your serverside and clientside apis
  ```ts
  // ws/apis.js

  // first, we must declare our api types.
  // (otherwise, typescript has a fit due to the mutual cross-referencing)

  export type Serverside = {
    sum(a: number, b: number): Promise<number>
  }

  export type Clientside = {
    now(): Promise<number>
  }

  // now we can define the api implementations.

  export const makeServerside = (
    clientside: Clientside): Serverside => ({

    async sum(a, b) {
      await clientside.now() // remember, each side can call the other
      return a + b
    },
  })

  export const makeClientside = (
    getServerside: () => Serverside): Clientside => ({

    async now() {
      return Date.now()
    },
  })
  ```
- on the serverside, we create a websocket server
  ```ts
  // ws/server.js

  import {WebSocketServer} from "renraku/node"
  import {Clientside, makeServerside} from "./apis.js"

  const server = new WebSocketServer({
    acceptConnection: async({remoteEndpoint, req, ip, headers}) => {
      const clientside = remote<Clientside>(remoteEndpoint)
      return {
        closed: () => {},
        localEndpoint: endpoint(makeServerside(clientside)),
      }
    },
  })

  server.listen(8000)
  ```
  - note that we have to import from `renraku/node`, because we keep all node imports separated to avoid making the browser upset
- on the clientside, we create a websocket remote
  ```ts
  // ws/client.js

  import {webSocketRemote, Api} from "renraku"
  import {Serverside, makeClientside} from "./apis.js"

  const {remote: serverside} = await webSocketRemote<Serverside>({
    url: "http://localhost:8000",
    getLocalEndpoint: serverside => endpoint(
      makeClientside(() => serverside)
    ),
    onClosed: () => {
      console.log("web socket closed")
    },
  })

  const result = await serverside.now()
  ```

<br/>

## ⛩ *RENRAKU* — more about the core primitives
- **`endpoint`** — function to generate a json-rpc endpoint for a group of async functions
  ```ts
  import {endpoint} from "renraku"

  const myEndpoint = endpoint(myFunctions)
  ```
  - the endpoint is an async function that accepts a json-rpc request, calls the appropriate function, and then returns the result in a json-rpc response
  - basically, the endpoint's inputs and outputs can be serialized and sent over the network — this is the transport-agnostic aspect
- **`remote`** — function to generate a nested proxy tree of invokable functions
  - you need to provide the api type as a generic for typescript autocomplete to work on your remote
  - when you invoke an async function on a remote, under the hood, it's actually calling the async endpoint function, which may operate remote or local logic
  ```ts
  import {remote} from "renraku"

  const myRemote = remote<typeof myFunctions>(myEndpoint)

  // calls like this magically work
  await myRemote.now()
  ```
- **`fns`** — helper function to keeps you honest by ensuring your functions are async and return json-serializable data
  ```ts
  import {fns} from "renraku"

  const timingFns = fns({
    async now() {
      return Date.now()
    },
  })
  ```
- **`mock`** — wrap local function in a renraku remote, just so the fancy *tune* syntax works happily
  ```ts
  import {mock, tune} from "renraku"

  const timingFns = mock({
    async now() {
      return Date.now()
    },
  })

  // mock enables the tune api for local functions
  await timingFns.now[tune]({notify: false, transfer: []})()
  ```

<br/>

## ⛩ *RENRAKU* — simple error handling
- you can throw an `ExposedError` when you want the error message sent to the client
  ```ts
  import {ExposedError, fns} from "renraku"

  const timingApi = fns({
    async now() {
      throw new ExposedError("not enough minerals")
        //                           ↑
        //                 publicly visible message
    },
  })
  ```
- any other kind of error will NOT send the message to the client
  ```ts
  import {fns} from "renraku"

  const timingApi = fns({
    async now() {
      throw new Error("insufficient vespene gas")
        //                           ↑
        // secret message is hidden from remote clients
    },
  })
  ```
- the intention here is security-by-default, because error messages could potentially include sensitive information

<br/>

## ⛩ *RENRAKU* — request limits
- `maxRequestBytes` prevents gigantic requests from dumping on you
  - `10_000_000` (10 megabytes) is the default
- `timeout` kills a request if it goes stale
  - `10_000` (10 seconds) is the default
- set these on your HttpServer
  ```ts
  new HttpServer(() => endpoint(fns), {
    timeout: 10_000,
    maxRequestBytes: 10_000_000,
  })
  ```
- or set these on your WebSocketServer
  ```ts
  new WebSocketServer({
    timeout: 10_000,
    maxRequestBytes: 10_000_000,
    acceptConnection,
  })
  ```

<br/>

## ⛩ *RENRAKU* — logging
- renraku's fallback logger is silent by default
- `endpoint` and `remote` accept callbacks like `onCall` and `onCallError` -- and these override the usage of the fallback logger
- but you can enable renraku's fallback logger like this
  ```ts
  import {logger} from "renraku"
  logger.enable()
  ```

<br/>

## ⛩ *RENRAKU* — carrier pigeons, as custom transport medium
- renraku has HttpServer and WebSocketServer out of the box, but sometimes you need it to work over another medium, like postMessage, or carrier pigeons.
- you're in luck because it's really easy to setup your own transport medium
- so let's assume you have a group of async functions called `myFunctions`
- first, let's do your "serverside":
  ```ts
  import {endpoint} from "renraku"
  import {myFunctions} from "./my-functions.js"

  // create a renraku endpoint for your functions
  const myEndpoint = endpoint(myFunctions)

  // create your wacky carrier pigeon server
  const pigeons = new CarrierPigeonServer({
    handleIncomingPigeon: async incoming => {

      // you parse your incoming string as json
      const request = JSON.parse(incoming)

      // execute the api call on your renraku endpoint
      const response = await myEndpoint(request)

      // you send back the json response as a string
      pigeons.send(JSON.stringify(response))
    },
  })
  ```
- second, let's do your "clientside":
  ```ts
  import {remote} from "renraku"
  import type {myFunctions} from "./my-functions.js"

  // create your wacky carrier pigeon client
  const pigeons = new CarrierPigeonClient()

  // create a remote with the type of your async functions
  const myRemote = remote<typeof myFunctions>(

    // your carrier pigeon implementation needs only to
    // transmit the json request object, and return then json response object
    async request => await carrierPigeon.send(request)
  )

  // usage
  await myRemote.math.sum(1, 2) // 3
  ```

<br/>

## ⛩ *RENRAKU* — optimizations with `notify` and `query`
json-rpc has two kinds of requests: "queries" expect a response, and "notifications" do not.  
renraku supports both of these.

don't worry about this stuff if you're just making an http api, this is more for realtime applications like websockets or postmessage for squeezing out a tiny bit more efficiency.

### let's start with a `remote`
```ts
import {remote, query, notify, tune, settings} from "renraku"

const fns = remote(myEndpoint)
```

### *new* use the `tune` symbol for setting multiple options per-call
```ts
await fns.hello.world[tune]({notify: true, transfer: [buffer]})
  // you can set notify true/false,
  // and you get set a transfer to send transferables, like for postMessage api
```

### use symbols to specify request type
- use the `notify` symbol like this to send a notification request
  ```ts
  await fns.hello.world[notify]()
    // you'll get null, because notifications have no responses
  ```
- use the `query` symbol to launch a query request which will await a response
  ```ts
  await fns.hello.world[query]()

  // query is the default, so usually this is equivalent:
  await fns.hello.world()
  ```

### use the `settings` symbol to set-and-forget
```ts
// changing the default for this request
fns.hello.world[settings].notify = true

// now this is a notification
await fns.hello.world()

// unless we override and specify otherwise
await fns.hello.world[query]()
```

### you can even make your whole remote default to `notify`
```ts
const fns = remote(endpoint, {notify: true})

// now all requests are assumed to be notifications
await fns.hello.world()
await fns.anything.goes()
```

### you can use the `Remote` type when you need these symbols
- the `remote` function applies the `Remote` type automatically
  ```ts
  const fns = remote(endpoint)

  // ✅ happy types
  await serverside.update[notify](data)
  ```
- but you might have a function that accepts some remote functionality
  ```ts
  async function whatever(serverside: Serverside) {

    // ❌ bad types
    await serverside.update[notify](data)
  }
  ```
- you might need to specify `Remote` to use the remote symbols
  ```ts
  import {Remote} from "renraku"

  async function whatever(serverside: Remote<Serverside>) {

    // ✅ happy types
    await serverside.update[notify](data)
  }
  ```

<br/>

## ⛩ *RENRAKU* means *contact*
💖 free and open source just for you  
🌟 gimme a star on github  

