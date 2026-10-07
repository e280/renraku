
# 連絡 <br/> ***R·E·N·R·A·K·U***

**renraku makes async typescript functions callable across boundaries.**  
servers can expose functions for clients to call. iframes can expose functions for pages to call. websockets. web workers. the details melt away, and you just focus on async functions.

you are looking at prerelease v0.6 `@e280/renraku@next`, which does not yet have docs. you may instead like to see the [v0.5 `@e280/renraku@latest` readme](https://github.com/e280/renraku/tree/ohfive#readme).



<br/>

## websocket client

```ts
import {connect, Messenger} from "@e280/renraku"
```

- **connect the socket.**
    ```ts
    const connection = await connect(new WebSocket("https://e280.org/api"))
    ```
- **create a messenger, and give it connection messages.**
    ```ts
    const {recv, remote} = new Messenger<RemoteFns>({send: connection.send})

    connection.onRecv(recv)
    ```
- **read cool stats about ping time.**  
    renraku automatically pings every 10s, to keep the socket alive and give you these stats.
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

