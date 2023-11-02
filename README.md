# serverless-websockets
Using AWS Lambda to provide Serverless Websockets

## Description
 
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

## Usage
### Deployment
Install dependencies and deploy with:

``` bash
$ npm install
$ serverless deploy
```

_Note_: In current form, after deployment, the API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [`httpApi` event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/). 

With the current configuration, the DynamoDB table will be removed when running `serverless remove`. To retain it, uncomment `DeletionPolicy: Retain` in serverless.yml.

### Development
The command `serverless offline` may be useful to test things locally. Lambda triggers however haven't been adapted to run locally, therefore one can send messages to the websocket but would not receive anything from other clients.

This project was started using a template from [Serverless](https://github.com/serverless/examples/tree/v3/aws-node-express-dynamodb-api). It uses older versions for some development dependencies, this triggers a warning when running `npm install`. Updating those dependencies would be good, however there are breaking changes and they don't appear to pose a security risk since they are only being used locally. Since this is only a prototype those dependencies have not been updated yet.