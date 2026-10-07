
# 連絡 <br/> ***R·E·N·R·A·K·U***

**renraku makes async typescript functions callable across boundaries.**  
servers can expose functions for clients to call. iframes can expose functions for pages to call. websockets. web workers. the details melt away, and you just focus on async functions.

you are looking at wip docs for prerelease v0.6 `@e280/renraku@next`. you may instead like to see the [v0.5 `@e280/renraku@latest` readme](https://github.com/e280/renraku/tree/ohfive#readme).



<br/>

## ⛩️ renraku's *remotes* are the best part.

```ts
import {asFns, makeEndpoint, makeRemote, Messenger} from "@e280/renraku"
```

- **renraku is about async fns.**
    ```ts
    const myFns = asFns({
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
    })
    ```
- **endpoints make fns json-callable.**
    ```ts
    const myEndpoint = makeEndpoint(myFns)
    ```
    ```ts
    await myEndpoint([["sum"], 1, 2])
      // {ok: true, value: 3}
    ```
- **🌠 remotes make endpoints beautiful.**
    ```ts
    const myRemote = makeRemote<typeof myFns>(myEndpoint)
    ```
    ```ts
    await myRemote.hello()
      // "world"
    ```
    ```ts
    await myRemote.sum(1, 2)
      // 3
    ```
    ```ts
    await myRemote.nesty.is.besty()
      // 0.103639826821733
    ```
- **messenger enables bidirectional rpc.**
    ```ts
    const alice = new Messenger(myEndpoint)
    const bob = new Messenger(makeEndpoint({rizz: async() => "sup"}))

    alice.onSend(bob.recv)
    bob.onSend(alice.recv)
    ```
    ```ts
    // alice's remote talks to bob
    await alice.remote.rizz()
      // "sup"
    ```
    ```ts
    // bob's remote talks to alice
    await bob.remote.hello()
      // "world"
    ```



<br/>

## ⛩️ renraku http api.

- **serverside, node.**
    ```ts
    import {createServer} from "node:http"
    import {httpListener, makeEndpoint} from "@e280/renraku/node"

    createServer(httpListener(makeEndpoint(myFns)))
      .listen(8080)
    ```
- **clientside, web or node.**
    ```ts
    import {httpRemote} from "@e280/renraku"

    const remote = httpRemote<typeof myFns>("https://e280.org/api")
    ```
    ```ts
    await remote.hello()
      // "world"
    ```



<br/>

## ⛩️ websocket client.

```ts
import {socle, Messenger, connect} from "@e280/renraku"
```

- **make a websocket connection with a messenger.**
    ```ts
    const {remote, connection} = socle({
      messenger: new Messenger<typeof myFns>(),
      connection: await connect(new WebSocket("wss://e280.org/api")),
    })
    ```
- **read cool stats about ping time.**  
    renraku auto pings every 10s, to keep the socket alive.
    ```ts
    connection.rtt.latest // 81
    connection.rtt.average // 84
    ```
- **call remote fns.**
    ```ts
    await remote.hello() // "world"
    ```
- **decide what happens when the connection is closed.**
    ```ts
    connection.onClose(() => console.log("connection closed"))
    ```
- **close the connection.**
    ```ts
    connection.close()
    ```



<br/><br/>

🧑‍💻 *https://e280.org/*

