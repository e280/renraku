
# 連絡 <br/> ***R·E·N·R·A·K·U***
> *elegant weapons, for a more civilized age.*

**renraku makes typescript functions callable across boundaries.**  
servers can expose functions for clients to call. iframes can expose functions for pages to call. websockets. web workers. the details melt away, and you just focus on async functions.

you are looking at wip docs for prerelease v0.6 `@e280/renraku@next`. you may instead like to see the [v0.5 `@e280/renraku@latest` readme](https://github.com/e280/renraku/tree/ohfive#readme).



<br/>

## ⛩️ renraku provides composable primitives.

### 🍙 renraku is about async fns.
```ts
import {makeEndpoint, makeRemote, Messenger} from "@e280/renraku"

const myFns = {
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

const myEndpoint = makeEndpoint(myFns)

await myEndpoint([["sum"], 1, 2])
  // {ok: true, value: 3}
```

### 🍙 remotes make endpoints *beautiful* 🌟
```ts
const myRemote = makeRemote<typeof myFns>(myEndpoint)

await myRemote.hello()
  // "world"

await myRemote.sum(1, 2)
  // 3

await myRemote.nesty.is.besty()
  // 0.103639826821733
```

### 🍙 messengers enable bidirectionality.
```ts
const bobsFns = {rizz: async() => "sup"}

const alice = new Messenger<typeof bobFns>(myEndpoint)
const bob = new Messenger<typeof myFns>(makeEndpoint(bobFns))

alice.onSend(bob.recv)
bob.onSend(alice.recv)

// alice talks to bob.
await alice.remote.rizz()
  // "sup"

// bob talks to alice.
await bob.remote.hello()
  // "world"
```



<br/>

## ⛩️ renraku over http.

### 🍙 serverside (node).
```ts
import {createServer} from "node:http"
import {httpListener, makeEndpoint} from "@e280/renraku/node"

createServer(httpListener(makeEndpoint(myFns)))
  .listen(8080)
```

### 🍙 clientside (web, node).
```ts
import {httpRemote} from "@e280/renraku"

const remote = httpRemote<typeof myFns>("https://e280.org/api")

await remote.hello()
  // "world"
```



<br/>

## ⛩️ renraku over websockets.

### 🍙 serverside (node).
```ts
import {createServer} from "node:http"
import {websockets, wire, connect, messenger} from "@e280/renraku"

createServer()
  .on("upgrade", websockets(async websocket => {
    const {connection, remote} = wire({
      connection: await connect(websocket),
      messenger: new Messenger<ClientFns>(serverEndpoint),
    })

    await remote.hello()
      // "world"

    // handle connection closed
    connection.onClose(() => console.log("closed"))

    // close the connection yourself
    connection.close()
  }))
  .listen(8080)
```

### 🍙 clientside (web, node).
```ts
import {wire, connect, messenger} from "@e280/renraku"

const {connection, remote} = wire({
  messenger: new Messenger<ServerFns>(clientEndpoint),
  connection: await connect(new WebSocket("wss://e280.org/api")),
})

await remote.hello()
  // "world"

connection.rtt.latest // 81
connection.rtt.average // 84

connection.onClose(() => console.log("connection closed"))
connection.close()
```



<br/><br/>

🧑‍💻 *https://e280.org/*

