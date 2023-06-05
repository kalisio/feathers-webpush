import makeDebug from 'debug'
import feathers from '@feathersjs/feathers'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import express from '@feathersjs/express'
import { Service } from '../lib/index.js'
import _ from 'lodash'

feathers.setDebug(makeDebug)

let app, service, expressServer

const dataNotification = {
  title: 'feathers-webpush example title',
  body: 'feathers-webpush example body',
  icon: 'https://s3.eu-central-1.amazonaws.com/kalisioscope/kapp/kapp-icon-256x256.png',
  url: 'https://kalisio.com/'
}

class SubscriptionService {
  constructor () {
    this.subscriptions = [{
      endpoint: 'endpoint',
      auth: 'auth',
      p256dh: 'p256dh'
    }]
  }

  async find (params) {
    if (_.isEmpty(params.query)) return this.subscriptions
    return _.find(this.subscriptions, (subscription) => {
      return params.query.id ? subscription.id === params.query.id : subscription.endpoint === params.query.endpoint
    })
  }
}

describe('feathers-webpush-service', () => {
  before(async () => {
    chailint(chai, util)
    app = express(feathers())
    app.use(express.json())
    app.configure(express.rest())
    app.use('subscriptions', new SubscriptionService())
  })
  it('is ES module compatible', () => {
    expect(typeof Service).to.equal('function')
  })
  it('create the service', async () => {
    app.use('push', new Service({
      vapidKeys: {
        publicKey: process.env.PUBLIC_VAPID_KEY,
        privateKey: process.env.PRIVATE_VAPID_KEY
      },
      subject: process.env.SUBJECT,
      app
    }), {
      methods: ['create']
    })
    service = app.service('push')
    expect(service).toExist()
    expressServer = await app.listen(3333)
  })
  it('send webpush notifications', async () => {
    // const eventReceived = true
    // const response = await service.create({
    //   dataNotification,
    //   serviceSubscription: 'subscriptions'
    // })
    // console.log(response)
    // expect(response).toExist()
    // expect(response.statusCode).to.equal(201)
    // expect(eventReceived).beTrue()
  })
  after(async () => {
    await expressServer.close()
  })
})
