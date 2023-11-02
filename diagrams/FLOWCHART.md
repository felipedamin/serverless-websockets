``` mermaid
flowchart TD
  A(Player1) --> |1.1 Connect to Socket| B[Serverless Websocket]
  F(Player2) --> |1.2 Connect to Socket| B
  B --> |1.3 Save each player and connection information| C[(Websockets Table)]
  A --> |2.1 Send message to player2| B
  B --> |2.2 Write message to DB| D[(Messages Table)]
  D -.-> |2.3 Trigger| E[Post Message Endpoint]
  E --> |3.1 Request player data| C
  E --> |3.2 Sends message to player2| F
```