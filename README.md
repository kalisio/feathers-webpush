# feathers-webpush

[![Latest Release](https://img.shields.io/github/v/tag/kalisio/feathers-webpush?sort=semver&label=latest)](https://github.com/kalisio/feathers-webpush/releases)
[![Build Status](https://app.travis-ci.com/kalisio/feathers-webpush.svg?branch=master)](https://app.travis-ci.com/kalisio/feathers-webpush)
[![Code Climate](https://codeclimate.com/github/kalisio/feathers-webpush/badges/gpa.svg)](https://codeclimate.com/github/kalisio/feathers-webpush)
[![Test Coverage](https://codeclimate.com/github/kalisio/feathers-webpush/badges/coverage.svg)](https://codeclimate.com/github/kalisio/feathers-webpush/coverage)
[![Download Status](https://img.shields.io/npm/dm/@kalisio/feathers-webpush.svg?style=flat-square)](https://www.npmjs.com/package/@kalisio/feathers-webpush)

> `feathers-webpush` simplifies the sending of web push notifications in a FeathersJS application.

## Principle

The `feathers-webpush` module provides a simplified way to send web push notifications in a FeathersJS application. It leverages the [web-push package](https://github.com/web-push-libs/web-push) to interact with the Web Push protocol.

![feathers-webpush principle](./docs/feathers-webpush-principle.png)

## Usage

### Installation

```shell
npm install @kalisio/feathers-webpush --save
```

or

```shell
yarn add @kalisio/feathers-webpush
```

### Example

The provided [example](./example/README.md) illustrates how to setup:

* a [server app](./example/app.mjs)
* a [browser client app](./example/public/index.html)

## API

### Service (options)

Create an instance of the service with the given options:

| Parameter | Description | Required |
|---|---|---|
|`vapidDetails` | The vapidDetails configuration. Refer to the [web-push package documentation](https://github.com/web-push-libs/web-push#input-3) for more information. | yes |
| `app` |  The feathers app instance. | yes |

### create (data, params)

The `create` method is used to send web push notifications. The `data` payload must contain the following properties:

| Property | Description | Required |
|---|---|---|
|`dataNotification` | The payload text for the push notification. | yes |
| `subscriptionService` |  The name of the service where subscriptions are registered. | yes |
| `subscriptionFilter` |  The filter you wish to apply when retrieving subscriptions. | no |

> **Note:** The subscription should be registered in the following format:
```js
{ subscriptions: [{ endpoint: 'url_firefox', keys: { auth: 'xxxx', p256dh: 'xxxx' } }, { endpoint: 'url_chrome', keys: { auth: 'xxxx', p256dh: 'xxxx' }}]}  
{ subscription: { endpoint: 'url_google', keys: { auth: 'xxxx', p256dh: 'xxxx' }}}
```

## Tests

To run the tests for `feathers-webpush`, install the required node modules and run `npm run test` or `yarn test`.

To perform the tests, you need to create web push subscription and set the following environment variables:
* `SUBSCRIPTION_TEST_ENDPOINT`
* `SUBSCRIPTION_TEST_KEY_AUTH`
* `SUBSCRIPTION_TEST_KEY_P256DH`

## License

Copyright (c) 2017-20xx Kalisio

Licensed under the [MIT license](LICENSE).

## Authors

This project is sponsored by 

[![Kalisio](https://s3.eu-central-1.amazonaws.com/kalisioscope/kalisio/kalisio-logo-black-256x84.png)](https://kalisio.com)
