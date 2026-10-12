
# 連絡 <br/> ***R·E·N·R·A·K·U***
> *elegant weapons, for a more civilized age.*

📦 `npm install @e280/renraku@next`

**renraku makes typescript functions callable across any boundary.**  
*servers and clients. http and websockets. node and web workers. popups and iframes... carrier pigeons.*  

have you ever found yourself making an api call by using `fetch`... or worse... `postMessage`?  
*stop it. get some help.*  

🍙 [renraku's sharp little primitives.](#primitives)  
🥡 [renraku over http.](#http)  
♨️ [renraku errors and security.](#errors)  
📬 [renraku messengers.](#messengers)  
🎏 [renraku over websockets.](#websockets)  
🌀 [renraku portals.](#portals)  
🐝 [renraku cluster.](#cluster)  

> [!TIP]
> *you are looking at wip docs for renraku@next `v0.6` — you may instead like to see the [v0.5 readme](https://github.com/e280/renraku/tree/ohfive#readme).*



<br/><a id="primitives"></a>

## ⛩️ renraku's sharp little primitives.
> *it's a minimalist toolkit to help your async functions reach their fullest potential.*

### 🍙 renraku is about async fns.
> *basic typescript, easy peasy.*
```ts
type AliceFns = typeof aliceFns

const aliceFns = {
  async hello() {
    return "world"
  },

  async sum(a: number, b: number) {
    return a + b
  },

  nesty: {
    is: {
      async besty() {
        return Math.random()
      },
    },
  },
}
```
```ts
await aliceFns.hello()
  // "world"

await aliceFns.sum(1, 2)
  // 3

await aliceFns.nesty.is.besty()
  // 0.103639826821733
```

### 🍙 endpoints make fns json-callable.
> *renraku's most basic plumbing primitive.*
```ts
import {makeEndpoint} from "@e280/renraku"

const aliceEndpoint = makeEndpoint(aliceFns)

await aliceEndpoint([["sum"], 1, 2])
  // {ok: true, value: 3}
```

### 🌟 remotes make endpoints... *beautiful.*
> *ah, the crown jewel of renraku.*  
> *a remote for aliceFns looks and feels like the real deal...*  
> *...even if alice is actually a million miles away. actually, let's do that next.*  
```ts
import {makeRemote} from "@e280/renraku"

const remote = makeRemote<AliceFns>(aliceEndpoint)
```
```ts
await remote.hello()
  // "world"

await remote.sum(1, 2)
  // 3

await remote.nesty.is.besty()
  // 0.103639826821733
```



<br/><a id="http"></a>

## ⛩️ renraku over http.
> *okay time for the stunt: let's put your functions on a server, and call 'em.*

### 🥡 serverside (node).
> *\*foop!\* — it's that easy, you blinked and your fns just became an api!*
```ts
import {createServer} from "node:http"
import {makeEndpoint} from "@e280/renraku"
import {httpListener} from "@e280/renraku/node"

createServer(httpListener(makeEndpoint(aliceFns)))
  .listen(8080)
```

### 🥡 clientside (web, node).
> *\*schwam!\* — now your website has a remote for calling the serverside fns!*
```ts
import {httpRemote} from "@e280/renraku"

const remote = httpRemote<AliceFns>("http://localhost:8080")
```
```ts
await remote.hello()
  // "world"

await remote.sum(1, 2)
  // 3

await remote.nesty.is.besty()
  // 0.103639826821733
```
> *as far as the rest of your app's code is concerned, having `remote` is similar to directly having `aliceFns`.  
> *okay, what you've now already learned about renraku will cover 80% of use-cases, so you could pack it up here...*  
> *unless you're building something super cool.*  



<br/><a id="errors"></a>

## ⛩️ renraku errors and security.
> *this advanced esoteric knowledge will serve you well.*

### ♨️ fns can throw errors.
- **security precaution:** by default, renraku endpoints conceal error info from clients.  
    they see a generic `RemoteError: an error occurred (details not exposed, renraku security precaution)`
- renraku will expose error details from any *instanceof* `ExposedError`:
    ```ts
    import {ExposedError} from "@e280/renraku"

    throw new ExposedError("bingus")
      // clients would see "RemoteError: ExposedError: bingus"
    ```
- `makeEndpoint` option `exposeAllErrors` exposes error info to the client.
    ```ts
    // danger mode, but great for debugging web workers.
    makeEndpoint(aliceFns, {exposeAllErrors: true})
    ```

### ♨️ renraku has no opinions about auth.
- maybe you'll like authlocal for authentication and authorization: https://github.com/e280/authlocal



<br/><a id="messengers"></a>

## ⛩️ renraku messengers.
> *messengers are really flexible and powerful, we'll use them a lot in the next sections.*

### 📬 messengers enable bidirectionality.
- **introducing... *bob.***
    ```ts
    type BobFns = typeof bobFns

    const bobFns = {
      async bingus() {
        return 123
      }
    }

    const bobEndpoint = makeEndpoint(bobFns)
    ```
- **alice and bob each get their own messenger.**  
    ```ts
    import {Messenger} from "@e280/renraku"

    const alice = new Messenger<BobFns>(aliceEndpoint)
    const bob = new Messenger<AliceFns>(bobEndpoint)
    ```
- **to aid your understanding,** we *could* wire them together, crisscross-style, so they can call each other.
    ```ts
    alice.onSend(bob.recv)
    bob.onSend(alice.recv)
    ```
    then, alice and bob could call each other's fns.
    ```ts
    // alice talks to bob.
    await alice.remote.bingus()
      // 123

    // bob talks to alice.
    await bob.remote.hello()
      // "world"
    ```
    but that's not really practical, we just wanted you to understand that two messengers are designed to talk to one another.



<br/><a id="websockets"></a>

## ⛩️ renraku over websockets.
> *we're going bidirectional, try not to go cross-eyed.*

### 🎏 alice's serverside (node).
> *okay there are some new primitives here, but what matters most is that you see the messenger coming in clutch.*
```ts
import {createServer} from "node:http"
import {websockets} from "@e280/renraku/node"
import {wire, connect, Messenger} from "@e280/renraku"

createServer()
  .on("upgrade", websockets(async websocket => {
    const {connection, messenger} = wire({
      connection: await connect(websocket),
      messenger: new Messenger<BobFns>(aliceEndpoint),
    })

    // we are alice-the-server, we can call bob-the-client's fns!
    await messenger.remote.bingus()
      // 123

    // automatic ping time stats
    connection.rtt.latest // 81
    connection.rtt.average // 84

    // handle connection closed
    connection.onClose(() => console.log("closed"))

    // // close the connection whenever you want
    // connection.close()
  }))
  .listen(8080)
```

### 🎏 bob's clientside (web, node).
> *again with the messenger, see it?*
```ts
import {wire, connect, Messenger} from "@e280/renraku"

const {connection, messenger} = wire({
  messenger: new Messenger<AliceFns>(bobEndpoint),
  connection: await connect(new WebSocket("ws://localhost:8080")),
})
```
here we are as bob-the-client, calling alice-the-server's functions:
```ts
await messenger.remote.hello()
  // "world"
```
and remember, it goes both ways: alice can now call bob's functions, too.



<br/><a id="portals"></a>

## ⛩️ renraku portals.
> *portals bond messengers to [message ports](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort).*

### 🌀 web workers.
> *notice that we're importing some things from `@e280/renraku/web`.*
- **hostside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWorkerPort} from "@e280/renraku/web"

    const {remote} = makePortal({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await acceptWorkerPort(
        new Worker("./my-worker.bundle.min.js", {type: "module"})
      ),
    })

    await remote.bingus()
      // 123
    ```
    - `acceptWorkerPort`'s job is to do a postMessage connection handshake with the worker, and obtain a MessagePort.
    - `autoTransfer` from renraku-web, auto-transfers web transferables like ArrayBuffer, OffscreenCanvas, stuff like that. [transferables on mdn.](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) alternatively write your own transfer fn, or use `noTransfer` from renraku-core to opt-out of transfers.
- **workerside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWorkerPort} from "@e280/renraku/web"

    const {remote} = makePortal({
      autoTransfer,
      port: await offerWorkerPort(),
      messenger: new Messenger<AliceFns>(bobEndpoint),
    })

    await remote.hello()
      // "world"
    ```

### 🌀 node workers.
> *notice that we're importing some things from `@e280/renraku/node`.*
- **hostside.**
    ```ts
    import {Worker} from "node:worker_threads"
    import {makePortal, Messenger} from "@e280/renraku"
    import {nodeAutoTransfer, nodeAcceptWorkerPort} from "@e280/renraku/node"

    const {remote} = makePortal({
      autoTransfer: nodeAutoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await nodeAcceptWorkerPort(new Worker("./my-worker.js")),
    })

    await remote.bingus()
      // 123
    ```
- **workerside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {nodeAutoTransfer, nodeOfferWorkerPort} from "@e280/renraku/node"

    const {remote} = makePortal({
      autoTransfer: nodeAutoTransfer,
      port: await nodeOfferWorkerPort(),
      messenger: new Messenger<AliceFns>(bobEndpoint),
    })

    await remote.hello()
      // "world"
    ```

### 🌀 iframes.
> *see how it's the same pattern as the workers, but what's different is how we get the `port`?*
- **parentside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWindowPort} from "@e280/renraku/web"

    const iframe = document.createElement("iframe")
    iframe.src = "http://localhost:8080/iframe"
    document.body.append(iframe)

    const {remote} = makePortal({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await acceptWindowPort({
        topic: "example",
        from: iframe.contentWindow!,
        origin: "http://localhost:8080",
      }),
    })

    await remote.bingus()
      // 123
    ```
- **iframeside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWindowPort} from "@e280/renraku/web"

    const {remote} = makePortal({
      autoTransfer,
      messenger: new Messenger<AliceFns>(bobEndpoint),
      port: await offerWindowPort({
        topic: "example",
        to: window.parent,
        origin: "http://localhost:8080",
      }),
    })

    await remote.hello()
      // "world"
    ```

### 🌀 popups.
> *you may notice that the host side is always the offer accepter, whereas it's the worker/popup/iframe that is always the one sending the offer. that's because the offerer knows when it's done loading, so the offer isn't missed by the host side, which is already done loading.*
- **openerside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWindowPort} from "@e280/renraku/web"

    const popup = window.open("http://localhost:8080/popup")
    if (!popup) throw new Error("popup blocked")

    const {remote} = makePortal({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await acceptWindowPort({
        topic: "example",
        from: popup,
        origin: "http://localhost:8080",
      }),
    })

    await remote.bingus()
      // 123
    ```
- **popupside.**
    ```ts
    import {makePortal, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWindowPort} from "@e280/renraku/web"

    const {remote} = makePortal({
      autoTransfer,
      messenger: new Messenger<AliceFns>(bobEndpoint),
      port: await offerWindowPort({
        topic: "example",
        to: window.opener!,
        origin: "http://localhost:8080",
      }),
    })

    await remote.hello()
      // "world"
    ```



<br/><a id="cluster"></a>

## ⛩️ renraku cluster.
> *for distributing workloads across a pool of workers.*  
> *yes, renraku can do that too.*  

### 🐝 parallelism (your cpu count minus one).
- **web parallelism.**
    ```ts
    import {parallelism} from "@e280/renraku/web"

    parallelism() // 7
    ```
- **node parallelism.**
    ```ts
    import {nodeParallelism} from "@e280/renraku/node"

    nodeParallelism() // 7
    ```

### 🐝 cluster.
- **follow the worker tutorial from above.**
    ```ts
    // you prepare this fn to make your worker portal
    async function myWorkerPortal() {
      throw "todo"
    }
    ```
- **load up your worker portals, and grab their endpoints.**
    ```ts
    import {array} from "@e280/stz"

    const portals = await Promise.all(
      array(parallelism(), myWorkerPortal)
    )

    const endpoints = portals.map(p => p.messenger.remoteEndpoint)
    ```
- 🌟 **now you create a cluster remote.**
    ```ts
    import {cluster} from "@e280/renraku"

    const remote = cluster(endpoints)
    ```
    it's just like a normal remote. except each call goes to a different endpoint.
    ```ts
    await remote.hello()
      // "world"
    ```
    concurrent work gets distributed. *imagine the possibilities* 🌈
    ```ts
    await Promise.all([
      remote.hello(),
      remote.superComplexBigWorkload(123),
      remote.megaGiantRenderTask({offscreenCanvas, hugeBuffer}),
    ])
    ```



<br/><br/>

🧑‍💻 *https://e280.org/*

