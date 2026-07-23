
# changelog for `@e280/renraku`
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.5

### v0.5.9
- 🍏 update deps, upgrade scute version for demo page

### v0.5.8
- 🍏 update deps, switch from stz `drill` to `dig` utility fn

### v0.5.7
- 🍏 update deps, tsconfig, and gh workflows

### v0.5.6
- 🍏 fix release workflow

### v0.5.5
- 🍏 use new npm trusted publishers for package deployment

### v0.5.4
- 🍏 fix dropped promise in remote
- 🍏 update deps

### v0.5.3
- 🍏 update deps

### v0.5.2
- 🍏 make `wsConnect` option `disconnected` optional, and actually work

### v0.5.1
- 🍏 make WindowConduit ignore non-jsonrpc messages, avoiding unwanted noise
- 🍏 update deps

### v0.5.0 🎉
- 🍏 just decided it was time to get outta prerelease hell

### v0.5.0-31
- 🍏 export the pingponger for outside use

### v0.5.0-30
- 🍏 update dependencies

### v0.5.0-29
- 🟥 rework `Messenger` to take two generic types, `<LocalFns, RemoteFns>`

### v0.5.0-28
- 🍏 update dependencies

### v0.5.0-27
- 🍏 fix: add writable `targetOrigin` on `WindowConduit`

### v0.5.0-26
- 🍏 export `MessengerMeta`

### v0.5.0-25
- 🟥 revert previous renames, lol:
  - `WsAccepter` => `Accepter`
  - `WsAccepter` => `Connector`
  - `asWsAccepter` => `asAccepter`
  - `asWsConnector` => `asConnector`

### v0.5.0-24
- 🟥 renames:
  - `makeEndpointListener` => `makeRequestListener`
  - `EndpointListenerOptions` => `RequestListenerOptions`
- 🟥 renames:
  - `Accepter` => `WsAccepter`
  - `Connector` => `WsAccepter`
  - `asAccepter` => `asWsAccepter`
  - `asConnector` => `asWsConnector`
- 🟥 rework logging and tap system
  - remove logger's `websocket` and `http` methods
  - add new `bindTap` fn helper
  - tap methods now take `TapContext` with label, meta, etc
- 🟥 rename `fns` helper to `asFns`
- 🟥 make `Rpc` and `asRpc` async
- 🟥 `Messenger` rework:
  - replace `getLocalEndpoint` with simpler `rpc`, of type `MessengerRpc`
  - introduce helper `asMessengerRpc`
  - `Rig` replaced by `MessengerMeta`
- 🟥 obscure renames:
  - `WebSocketTaps` => `DoubleTap`
  - `tap.webSocket` => `tap.websocket`

### v0.5.0-23
- 🟥 lots of renames
  - websocket stuff heavily affected
  - `HttpRpc` -> `Rpc`
  - `asHttpRpc` -> `asRpc`
- 🟥 Messenger's getLocalEndpoint is now async
- 🍏 fixed issue with websocket initialization timings

### v0.5.0-22
- 🍏 add `messenger.remoteEndpoint`

### v0.5.0-21
- 🟥 rework `WindowConduit` to take options instead of positional args
- 🟥 core renames
	- 🟥 `remote` => `makeRemote`
	- 🟥 `endpoint` => `makeEndpoint`
	- 🟥 `mock` => `makeMock`
	- 🟥 `respond` => `execute`
- 🟥 http server and web sockets completely rewritten, see readme
- 🟥 use package.json "exports" feature to auto-export to node and browser
  - `import {} from "@e280/renraku/node"` becomes  
    `import {} from "@e280/renraku"`

### v0.5.0-20
- 🍏 update dependencies

### v0.5.0-19
- 🔶 renraku primitives now default to `ErrorTap`
  - note that `httpServer` defaults to the verbose `LoggerTap`

### v0.5.0-18
- 🟥 rename `AuthWrap` to `Secure`
- 🟥 rename `AuthUnwrap` to `Authorize`

### v0.5.0-17
- 🍏 add new `DudTap` which is a pure tap that does nothing

### v0.5.0-16
- 🍏 fix: mock passes tap to remote

### v0.5.0-15
- 🟥 rename tap's `requestError` to `rpcError`
  - because it's not request specific, it's for errors that happen during the course of an rpc call

### v0.5.0-14
- 🟥 **project moved to `@e280/renraku`**
- 🟥 massive refactor, many such changes, all new readme

---

### v0.5.0-11
- 🟥 `conduit.recv` now requires a 2nd argument `event`
  - is type `ChannelMessage` (requires `data` and `origin`)
  - this allows us to manually jack in and snoop for the `origin` on incoming messages

### v0.5.0-10
- 🟥 WindowConduit now takes a localWindow vs a targetWindow, as apparently we listen for messages on our own window, and post to another

### v0.5.0-9
- 🍏 most conduit subclasses now have a `conduit.dispose()` method to detach event listeners

### v0.5.0-8
- 🟥 rework replace loggers with `logger`, `logger.logcore`, and `logger.logtool` -- see the readme
  - `color` is no longer exported, now we yoink color from `@e280/science`
  - ngl this situation kinda stinks, we really need an official logging lib
- 🟥 rework `Messenger`, which now accepts a new `Conduit`
  - there used to be different kinds of messengers
  - now there's one Messenger class, and multiple kinds of Conduits

### v0.5.0-6
- 🍏 add new `mock` function, which just wraps functions in a remote

### v0.5.0-5
- 🟥 renamed `DeferredPromise` to `DeferPromise` to match slate (it does sound sus tho).
  - also upgraded deferPromise impl to match slate, gained entangle method

### v0.5.0-4
- 🟥 **deleted `PostMessenger`!** it was annoying to upkeep so i chucked it!
  - you gotta switch to using the new `Messenger` now, sorry
- 🟥 change `Bidirectional` to semantically separate `sendRequest` from `sendResponse`.
  - also added a `done` promise to sendRequest params, which enabled advanced integrations.

### v0.5.0-3
- 🟥 rework package `exports` for nodejs
  ```ts
    //    ❌ old bad entrypoint --------.
    //                                   \
  import {WebSocketServer} from "renraku/x/server.js"

    //    ✅ new good entrypoint -------.
    //                                   \
  import {WebSocketServer} from "renraku/node"
  ```
  - previously i actually tried to do the fancy auto environment detection thing, but ts lsp didn't seem to jive with it
  - so now i'm going with a simpler explicit pattern
- 🔶 change messenger portal types, rename `MessageBindables` to `PortalChannel`
- 🍏 add `AsFns` helper type, to keep your fn types honest

### v0.5.0-2
- 🔶 rename `advanced` symbol to `tune`
- 🔶 rename `logistics` symbol to `rig`

### v0.5.0-1
- 🟥 added optional `transfer` argument to Endpoint type
- 🟥 added required `logistics` argument to `Bidirectional->receive`
- 🔶 deprecate `PostMessenger` in favor of new `Messenger`
- 🍏 add new remote fn symbol `advanced` which allows us to specify `transfer` on remote requests
- 🍏 messenger has `logistics` system allowing us to specify `transfer` in local responses

## v0.4

### v0.4.3 — v0.4.5
- 🍏 updated dependencies
- 🍏 fixed proxies for async returns
- 🍏 improved readme

### v0.4.2
- 🍏 isColorSupported accepts env var `FORCE_COLOR`
- 🍏 deathWithDignity now doesn't die on uncaught errors
  -  added option `dieOnUncaught` which you can set `true` if you are a severe person

### v0.4.1
- 🍏 fix efficiency issue in webSocketRemote

### v0.4.0
changes and improvements
- 🍏 added new export `RandomUserEmojis`
- 🟥 revise arguments for `deadline(timeout, message, fn)`
- 🟥 require `onClose` in `webSocketRemote`
- 🟥 in webSocketRemote, rename `fns` to `remote`
  ```ts
  // BAD old way
  const {fns: serverside} = await webSocketRemote<Serverside>(options)

  // GOOD new way
  const {remote: serverside} = await webSocketRemote<Serverside>(options)
  ```

logging and error handling has been revised and greatly improved.
- 🔶 simplified RemoteError constructor to just take a message like ordinary Error
- 🟥 replaced `onInvocation(request, response)` with `onCall(request, remote)`
- 🟥 replaced endpoint `onError` with `onCallError`
- 🟥 replace `PrettyLogger` with `loggers`
  - now you just import `loggers` which is an instance of `Loggers`
  - it attempts to detect if the tty supports ansi colors
  - the loggers instance has ready-made functions `onCall`, `onCallError`, and `onError` for renraku logging
    - these are now the defaults
  - renraku now defaults to logging everything
    - i realized the first thing a developer wants to do, is see that their api is working, and probably start troubleshooting
    - it was just unacceptable to setup renraku and immediately see nothing and be confused and then have a chore to setup logging
    - so now, you can disable logging by passing empty functions for onCall/onCallError/onError
    - i suppose you could actually set those empty functions on the `logger` instance 🤔

## v0.3

### v0.3.0

- 🟥 WebSocketServer `acceptConnection` is now an async function
- 🟥 replaced `expose` function with similar new `endpoint` function
  ```ts
  // OLD -- this is outdated
  new HttpServer(expose(({headers}) => fns))

  // NEW -- do it like this now
  new HttpServer(({headers}) => endpoint(fns))
  ```
  - this new design is cleaner, and non-http apis like postMessage don't need to pretend and pass fake headers like before
  - we also removed the concept of an `Api` type and the `api` helper function
  - if you were using `api`, you are now expected to roll-your-own, like this:
    ```ts
    // OLD
    const myApi = api(({headers}) => ({...myFunctions}))
    new HttpServer(expose(myApi))

    // NEW
    import {ServerMetas} from "renraku"
    const myApi = ({headers}: ServerMetas) => ({...myFunctions})
    new HttpServer(meta => endpoint(myApi(meta)))
    ```
- 🟥 rename `maxPayloadBytes` to `maxRequestBytes`
- 🍏 new `PostMessenger` for bidirectional postmessage apis
- 🍏 add `timeout` for HttpServer and also WebSocketServer, defaults to 10 seconds.

<br/>

## v0.2

### v0.2.0

- 🟥 totally massive rewrite
  - everything has changed, deal with it 😎
  - you're gonna have to just read the new readme 💀

<br/>

## v0.1

- undocumented small tweaks and renames

<br/>

## v0.0

### v0.0.0-dev.53

- (breaking) added required parameter `timeout` to websocket server and client

### v0.0.0-dev.45

- (breaking) mass renames

  we removed all the `renraku` prefixes from various names

  it's now recommended to `import * from "renraku"`, and rename things like `renrakuApi` to `renraku.api`

- add an option for `renraku.mock` called `spike`, which allows you to intercept and manipulate outgoing calls. this is used for implementing logging or mock latency.

### v0.0.0-dev.44

- (breaking) complete renraku rewrite!

  you have to redo your renraku implementation. *sorry not sorry*

### v0.0.0-dev.43

- (breaking) remove mockRemote's withMeta and forceAuth with the newer more-capable `useMeta` and `useAuth`

### v0.0.0-dev.40

- (breaking) simplified signatures for policy, augment, apiContext
- (breaking) rename some interfaces like ToRemote to Remote, ToApiContext to ApiContext
- (breaking) rename _augment symbol to _meta
- rework readme tutorial accordingly

### v0.0.0-dev.39

- start of changelog

