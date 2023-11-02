# serverless-websockets
Using AWS API Gateway, Lambda Functions and DynamoDB to provide Serverless Websockets

## Description
This is a prototype that leverages AWS "serverless" infrastructure to provide a Websocket API. It provides an API where clients can easily connect to a websocket and start sending messages without having to worry about server-side infrastructure or scaling.

### How it works
Each connection is saved to a DynamoDB table (alongside data from the respective client, which is sent via query params when connecting).

When one client is sending a message to another one, a query retrieves the previously saved information which is then used to send the message to the second client through AWS API Gateway by using `ApiGatewayManagementApiClient` and `PostToConnectionCommand()`. 

A sequence diagram, where two clients connect to the websocket endpoint and then client1 sends a message to client2, can be seen below. Note that there is a stream from the Messages Table that triggers the execution of a second Lambda Function which handles the logic necessary in order to send the message to Client2.

``` mermaid
sequenceDiagram
  box clients
    participant Client1
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
  
  Client1->>WebsocketGateway: Connect
  WebsocketGateway->>Websockets Table: Save connection/client information
  WebsocketGateway-->>Client1: connection accepted!
  
  Client2->>WebsocketGateway: Connect
  WebsocketGateway->>Websockets Table: Save connection/client information
  WebsocketGateway-->>Client2: connection accepted!

  Note over Client1,WebsocketGateway: Both clients are connected to websocket API

  Client1->>WebsocketGateway: Sends Message
  WebsocketGateway->>Messages Table: Save Message
  Messages Table-->>WebsocketGateway: Message Saved
  WebsocketGateway-->>Client1: Message Sent!
  Messages Table-)postMessage API: triggers

  postMessage API->>Websockets Table: Get data
  Websockets Table-->>postMessage API: connection/client data
  postMessage API->>WebsocketGateway: PostToConnectionCommand()
  WebsocketGateway->>Client2: write message
```

### Scaling and Load Testing
There are two different scenarios that could be taken into consideration when it comes to scaling:
- Too many clients or connections;
- Too much data/messages in one connection;

The first case should not have a big impact due to the nature of the services this solution uses. Both AWS Lambda and DynamoDB are quite resilient when it comes to handling a huge number of incoming requests.

For the second case, it is important to consider that even if the infra can handle everything, the client may not be able to do so (specially if the client is using an unstable connection or has an old hardware). Therefore limiting the amount of messages (or how big they can be) could be considered depending on the use case of this solution. 

Nevertheless, for both scenarios, the impact on the infra itself could be better evaluated in a load test. This could be done by writing code to simulate a big number of messages being sent to the same client (there are different websocket libraries that could help with it), or to simulate a big number of clients exchanging messages in parallel. Important metrics that should be analyzed in those tests are both response time and error rate for the different steps described in the sequence diagram.

Since DB operations are most likely the most time consuming ones in this application, it is possible to consider using a cache instead of writing/reading directly to/from the DB, this could help to speed things up, and if persistence is needed the cache could be written to the DB after a predefined timeframe (depending on the use case and the load of the application this could be a few seconds or even minutes/hours).

### Security
The websocket endpoint in this API is public and could be invoked by anyone. In order to use it in production it would be wise to implement an [authorizer function](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-access-control.html). This should be done for two reasons: blocking non-users from using the application and also to block a client from impersonating others.

One of the endpoints (`postMessageToWebsocket`) is only used by our infra, so it should remain isolated from the public internet (the same applies for both DB tables).

As mentioned before, too much data in a single connection could harm the quality of the service for a client. For example, in a situation where this solution is used "as-is" for a multiplayer game it could be abused by a malicious player spoofing thousands of playerIDs and sending a hugh stream of messages to another player. Problems like this must be avoided and the easiest way to do so is by configuring an authorizer (which would block a player from spoofing) and to rate-limit how much data/messages a single player can send.

It should be noted that when disconnecting from the websocket no validation is being made, therefore a client could abuse this to disconnect other clients (same as before this attack is mitigated by authenticating the client). Also, data is not deleted from the DB after a client disconnects, this should be fixed before deploying to production if expecting a big number of users.

## Usage
### Deployment
Install dependencies and deploy with:

``` bash
$ npm install
$ serverless deploy
```

With the current configuration, the DynamoDB table will be removed when running `serverless remove`. To retain it, uncomment `DeletionPolicy: Retain` in serverless.yml.

### Testing
It is possible to test by using any websocket client. Just connect to the url passing the `playerId` as a query parameter and then start sending messages to other clients. Example url: `wss://{{websocketUrl}}/dev/?playerId=1`

Message: 
``` JSON
{
    "routeKey": "sendmessage",
    "action": "sendmessage",
    "message": "Hello, from player 1!",
    "playerId": "1",
    "destinationPlayerId": "2"
}
```


### Development
The command `serverless offline` may be useful to test things locally. Lambda triggers however haven't been adapted to run locally, therefore one can send messages to the websocket but would not receive anything from other clients.

This project was started using a template from [Serverless](https://github.com/serverless/examples/tree/v3/aws-node-express-dynamodb-api). It uses older versions for some development dependencies, this triggers a warning when running `npm install`. Updating those dependencies would be good, however there are breaking changes and they don't appear to pose a security risk since they are only being used locally. Since this is only a prototype those dependencies have not been updated yet.