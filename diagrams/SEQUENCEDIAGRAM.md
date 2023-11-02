``` mermaid
sequenceDiagram
  box clients
    participant Client
    participant Client2
  end
  box endpoints
    participant Gateway
    participant postMessage API
  end
  box dynamoDB tables
    participant Websockets Table
    participant Messages Table
  end
  
  Client->>Gateway: Connect
  Gateway->>Websockets Table: Save connection/player information
  Gateway-->>Client: connection accepted!
  
  Client2->>Gateway: Connect
  Gateway->>Websockets Table: Save connection/player information
  Gateway-->>Client2: connection accepted!

  Note over Client,Gateway: Both players connected to websocket API

  Client->>Gateway: Sends Message
  Gateway->>Messages Table: Save Message
  Messages Table-->>Gateway: Message Saved
  Gateway-->>Client: Message Sent!
  Messages Table->>postMessage API: triggers

  postMessage API->>Websockets Table: Get data
  Websockets Table-->>postMessage API: connection/player data
  postMessage API->>Gateway: PostToConnectionCommand()
  Gateway->>Client2: writes message
```