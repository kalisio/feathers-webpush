# Running the example

1. Install `web-push` package globally on your system: 

```shell
npm install web-push -g
```

2. Generate vapid keys:

```shell
web-push generate-vapid-keys --json
```

3. Setup the required environment variables: 

* `VAPID_PUBLIC_KEY`
* `VAPID_PRIVATE_KEY`
* `VAPID_SUBJECT`

4. Add the `VAPID_PUBLIC_KEY` to the top of the script in `example/src/index.js`

5. Start the server:

```shell
// Run the server/API
cd example
yarn install
yarn start:server
```

_By default, the server is listening on port `8081`. You can change it by settting the environment variable `PORT` to the desired value._

6. Start the client:

```shell
// In another terminal run the client app
cd example
yarn start:client
```

7. Connect to `localhost:8080`

_By default, the client is listening on port `8080`. You can change it by settting the environment variable `CLIENT_PORT` to the desired value._