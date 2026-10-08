
# 連絡 <br/> ***R·E·N·R·A·K·U***
> *elegant weapons, for a more civilized age.*

**renraku makes typescript functions callable across boundaries.**  
servers can expose functions for clients to call. iframes can expose functions for pages to call. websockets. web workers. the details melt away, and you just focus on async functions.

you are looking at wip docs for prerelease v0.6 `@e280/renraku@next`. you may instead like to see the [v0.5 `@e280/renraku@latest` readme](https://github.com/e280/renraku/tree/ohfive#readme).



<br/>

## ⛩️ renraku provides composable primitives.

### 🍙 renraku is about async fns.
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

### 🍙 endpoints make fns json-callable.
```ts
import {makeEndpoint} from "@e280/renraku"

const aliceEndpoint = makeEndpoint(aliceFns)

await aliceEndpoint([["sum"], 1, 2])
  // {ok: true, value: 3}
```

### 🍙 remotes make endpoints *beautiful* 🌟
```ts
import {makeRemote} from "@e280/renraku"

const remote = makeRemote<AliceFns>(myEndpoint)

await remote.hello()
  // "world"

await remote.sum(1, 2)
  // 3

await remote.nesty.is.besty()
  // 0.103639826821733
```

### 🍙 messengers enable bidirectionality.
- **introducing bob.**
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

    alice.onSend(bob.recv)
    bob.onSend(alice.recv)
    ```
- **alice and bob can call each other's fns.**
    ```ts
    // alice talks to bob.
    await alice.remote.bingus()
      // 123

    // bob talks to alice.
    await bob.remote.hello()
      // "world"
    ```



<br/>

## ⛩️ renraku over http.

### 🍵 serverside (node).
```ts
import {createServer} from "node:http"
import {makeEndpoint} from "@e280/renraku"
import {httpListener} from "@e280/renraku/node"

createServer(httpListener(makeEndpoint(aliceFns)))
  .listen(8080)
```

### 🍵 clientside (web, node).
```ts
import {httpRemote} from "@e280/renraku"

const remote = httpRemote<AliceFns>("http://localhost:8080")

await remote.hello()
  // "world"
```



<br/>

## ⛩️ renraku over websockets.

### 🎏 serverside (node).
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

    await messenger.remote.bingus()
      // 123

    // automatic ping time stats
    connection.rtt.latest // 81
    connection.rtt.average // 84

    // handle connection closed
    connection.onClose(() => console.log("closed"))

    // close the connection yourself
    connection.close()
  }))
  .listen(8080)
```

### 🎏 clientside (web, node).
```ts
import {wire, connect, Messenger} from "@e280/renraku"

const {connection, messenger} = wire({
  messenger: new Messenger<AliceFns>(bobEndpoint),
  connection: await connect(new WebSocket("wss://e280.org/api")),
})

await messenger.remote.hello()
  // "world"

connection.rtt.latest // 81
connection.rtt.average // 84

connection.onClose(() => console.log("closed"))
connection.close()
```



<br/>

## ⛩️ renraku portals.
portals bond messengers to [message ports](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort).  
let's learn how they work with web workers,  
then, we'll skim over other patterns.  

### 🎏 renraku imports
- `@e280/renraku` imports are environment-agnostic, they should work in node and web.
- `@e280/renraku/web` imports might only work on the web.
- `@e280/renraku/node` imports might only work on node.
- maybe sooner or later i'll look into deno and bun, that would be cool.

### 🎏 web worker (hostside).
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

### 🎏 web worker, (workerside).
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



<br/><br/>

🧑‍💻 *https://e280.org/*

