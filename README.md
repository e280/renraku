
# 連絡 <br/> ***R·E·N·R·A·K·U***
> *elegant weapons, for a more civilized age.*

> [!TIP]
> *you are looking at wip docs for renraku@next `v0.6` — you may instead like to see the [v0.5 readme](https://github.com/e280/renraku/tree/ohfive#readme).*

**renraku makes typescript functions callable across any boundary.**  
*servers and clients. http and websockets. node and web workers. popups and iframes. carrier pigeons.*  

📦 `npm install @e280/renraku@next`

🥡 [renraku http quickstart.](#http)  
🍙 [renraku primitives.](#primitives)  
📬 [renraku messengers.](#messengers)  
🎏 [renraku over websockets.](#websockets)  
🌀 [renraku ports.](#ports)  
🐝 [renraku cluster.](#cluster)  
♨️ [renraku errors and security.](#errors)  



<br/><a id="http"></a>

## ⛩️ renraku http quickstart.

### 🥡 you've got async functions.
```ts
const fns = {
  async hello() {
    return "world"
  },
  async sum(a: number, b: number) {
    return a + b
  },
}
```

### 🥡 serve 'em up.
```ts
import {serve} from "@e280/renraku/node"

await serve(8080, fns)
```

### 🥡 call them from anywhere.
```ts
import {httpRemote} from "@e280/renraku"

const remote = httpRemote<typeof fns>("http://localhost:8080")
```
```ts
await remote.hello()
  // "world"

await remote.sum(1, 2)
  // 3
```



<br/><a id="primitives"></a>

## ⛩️ renraku primitives.

### 🍙 introducing alice.
```ts
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
type AliceFns = typeof aliceFns
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
```ts
import {makeEndpoint} from "@e280/renraku"

const aliceEndpoint = makeEndpoint(aliceFns)

await aliceEndpoint([["sum"], 1, 2])
  // {ok: true, value: 3}
```

### 🌟 remotes make endpoints... *beautiful.*
```ts
import {makeRemote} from "@e280/renraku"

const remote = makeRemote<AliceFns>(aliceEndpoint)
```

### 🍙 real node plumbing to serve an endpoint.
```ts
import {createServer} from "node:http"
import {httpListener} from "@e280/renraku/node"

createServer(httpListener(aliceEndpoint))
  .listen(8080)
```

### 🍙 http remotes call an endpoint over the network.
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
notice that the local remote and this http remote both have the same shape of `AliceFns`. this allows your code to be decoupled and unaware of whether the fns are local or over the network. *now think of how juicy that is for testing.*



<br/><a id="messengers"></a>

## ⛩️ renraku messengers.

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
- **messengers work in pairs.**  
    they're meant to talk over a network/worker boundary, but here's a simple local example.
    ```ts
    alice.onSend(bob.recv)
    bob.onSend(alice.recv)
    ```
    thusly, alice and bob can call each other's fns.
    ```ts
    // alice talks to bob.
    await alice.remote.bingus()
      // 123

    // bob talks to alice.
    await bob.remote.hello()
      // "world"
    ```
- **bidirectionality is optional.**  
    the messenger endpoint param is optional.  
    it's ok for only one messenger in a pair to host an endpoint.



<br/><a id="websockets"></a>

## ⛩️ renraku over websockets.
> *wiring messengers across a websocket connection.*

### 🎏 alice's serverside (node).
```ts
import {createServer} from "node:http"
import {websockets} from "@e280/renraku/node"
import {wireConnection, connect, Messenger} from "@e280/renraku"

createServer()
  .on("upgrade", websockets(async websocket => {
    const {connection, messenger} = wireConnection({
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
```ts
import {wireConnection, connect, Messenger} from "@e280/renraku"

const {connection, messenger} = wireConnection({
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



<br/><a id="ports"></a>

## ⛩️ renraku ports.
> *wiring messengers across message ports for workers, iframes, popups, etc.*

### 🌀 web workers.
> *notice that we're importing some things from `@e280/renraku/web`.*
- **hostside.**
    ```ts
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWorkerPort} from "@e280/renraku/web"

    const {remote} = wirePort({
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
    - 🌟 `autoTransfer` from renraku-web, auto-transfers [web transferables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) like ArrayBuffer, OffscreenCanvas, stuff like that. alternatively write your own transfer fn, or use `noTransfer` from renraku-core to opt-out of transfers.
- **workerside.**
    ```ts
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWorkerPort} from "@e280/renraku/web"

    const {remote} = wirePort({
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
    import {wirePort, Messenger} from "@e280/renraku"
    import {nodeAutoTransfer, nodeAcceptWorkerPort} from "@e280/renraku/node"

    const {remote} = wirePort({
      autoTransfer: nodeAutoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await nodeAcceptWorkerPort(new Worker("./my-worker.js")),
    })

    await remote.bingus()
      // 123
    ```
- **workerside.**
    ```ts
    import {wirePort, Messenger} from "@e280/renraku"
    import {nodeAutoTransfer, nodeOfferWorkerPort} from "@e280/renraku/node"

    const {remote} = wirePort({
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
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWindowPort} from "@e280/renraku/web"

    const iframe = document.createElement("iframe")
    iframe.src = "http://localhost:8080/iframe"
    document.body.append(iframe)

    const {remote} = wirePort({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      ...await acceptWindowPort({
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
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWindowPort} from "@e280/renraku/web"

    const {remote} = wirePort({
      autoTransfer,
      messenger: new Messenger<AliceFns>(bobEndpoint),
      ...await offerWindowPort({
        topic: "example",
        to: window.parent,
        origin: "*",
      }),
    })

    await remote.hello()
      // "world"
    ```

### 🌀 popups.
> *you may notice that the host side is always the accepter, whereas it's the worker/popup/iframe that is sending the offer. that's because the offerer knows when it's done loading, so the offer isn't missed by the host side, which is already done loading.*
- **openerside.**
    ```ts
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, acceptWindowPort} from "@e280/renraku/web"

    const popup = window.open("http://localhost:8080/popup")
    if (!popup) throw new Error("popup blocked")

    const {remote} = wirePort({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      ...await acceptWindowPort({
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
    import {wirePort, Messenger} from "@e280/renraku"
    import {autoTransfer, offerWindowPort} from "@e280/renraku/web"

    const {remote} = wirePort({
      autoTransfer,
      messenger: new Messenger<AliceFns>(bobEndpoint),
      ...await offerWindowPort({
        topic: "example",
        to: window.opener!,
        origin: "*",
      }),
    })

    await remote.hello()
      // "world"
    ```



<br/><a id="cluster"></a>

## ⛩️ renraku cluster.
> *for distributing workloads across a pool of workers.*  

### 🐝 processors and parallelism.
- **web parallelism.**
    ```ts
    import {processors, parallelism} from "@e280/renraku/web"

    processors() // 8
      // the number of logical processors this hardware reports.

    parallelism() // 7
      // processors minus 1 (to leave the main thread alone).
    ```
- **node parallelism.**
    ```ts
    import {nodeProcessors, nodeParallelism} from "@e280/renraku/node"

    nodeProcessors() // 8
    nodeParallelism() // 7
    ```

### 🐝 cluster.
- **first, create your worker pool.**
    ```ts
    import {array} from "@e280/stz"

    // your fn creates a new web worker.
    const makeWorker = async() => wirePort({
      autoTransfer,
      messenger: new Messenger<BobFns>(aliceEndpoint),
      port: await acceptWorkerPort(
        new Worker("./my-worker.bundle.min.js", {type: "module"})
      ),
    })

    // make a pool of workers.
    const pool = await Promise.all(
      array(parallelism()).map(makeWorker)
    )

    // grab the worker endpoints.
    const endpoints = pool.map(p => p.messenger.remoteEndpoint)
    ```
- 🌟 **create your cluster.**
    ```ts
    import {cluster, makeRemote} from "@e280/renraku"

    const endpoint = cluster(endpoints)
    const remote = makeRemote<BobFns>(endpoint)
    ```
    each call goes to a different/available endpoint.
    ```ts
    await remote.bingus()
      // 123
    ```
    concurrent work is distributed. jobs are queued. *imagine the possibilities* 🌈
    ```ts
    await Promise.all([
      remote.bingus(),
      remote.superComplexBigWorkload(123),
      remote.megaGiantRenderTask({offscreenCanvas, hugeBuffer}),
    ])
    ```



<br/><a id="errors"></a>

## ⛩️ renraku errors and security.

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

### ♨️ renraku is not a security framework.
- **validation:** try [zod](https://github.com/colinhacks/zod) for validating incoming params.
- **auth:** try [authlocal](https://github.com/e280/authlocal) for authentication and authorization.
- **window ports:** carefully consider which windows and origins you trust.



<br/><br/>

🧑‍💻 *https://e280.org/*

