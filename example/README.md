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

4. Add the `PUBLIC_VAPID_KEY` to the top of the script in index.html

5. Start the server:

```shell
cd example
node ./app.mjs
```

_By default, the server is listening on port `3333`. You can change it by settting the environment variable `PORT` to the desired value._

6. Connect to `localhost:3333`