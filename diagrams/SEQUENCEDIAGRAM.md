``` mermaid
sequenceDiagram
  box clients
    participant Client
    participant Client2
  end
  box endpoints
    participant WebsocketGateway
    participant postMessage API
  end
  box dynamoDB tables
    participant Websockets Table
    participant Messages Table
  end
  
  Client->>WebsocketGateway: Connect
  WebsocketGateway->>Websockets Table: Save connection/player information
  WebsocketGateway-->>Client: connection accepted!
  
  Client2->>WebsocketGateway: Connect
  WebsocketGateway->>Websockets Table: Save connection/player information
  WebsocketGateway-->>Client2: connection accepted!

  Note over Client,WebsocketGateway: Both players connected to websocket API

  Client->>WebsocketGateway: Sends Message
  WebsocketGateway->>Messages Table: Save Message
  Messages Table-->>WebsocketGateway: Message Saved
  WebsocketGateway-->>Client: Message Sent!
  Messages Table->>postMessage API: triggers

  postMessage API->>Websockets Table: Get data
  Websockets Table-->>postMessage API: connection/player data
  postMessage API->>WebsocketGateway: PostToConnectionCommand()
  WebsocketGateway->>Client2: writes message
```