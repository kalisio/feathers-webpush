import feathers from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'
import express from '@feathersjs/express'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import makeDebug from 'debug'
import { Service } from '../lib/index.js'

feathers.setDebug(makeDebug)

let app, service, expressServer

const subscription = {
  subscriptions: [{
    endpoint: process.env.SUBSCRIPTION_TEST_ENDPOINT,
    keys: {
      auth: process.env.SUBSCRIPTION_TEST_KEY_AUTH,
      p256dh: process.env.SUBSCRIPTION_TEST_KEY_P256DH
    }
  }]
}

const vapidDetails = {
  subject: process.env.SUBJECT,
  publicKey: process.env.PUBLIC_VAPID_KEY,
  privateKey: process.env.PRIVATE_VAPID_KEY
}

class UserService extends MemoryService {}

describe('feathers-webpush-service', () => {
  before(async () => {
    chailint(chai, util)
    app = express(feathers())
    app.use(express.json())
    app.configure(express.rest())
    app.use('users', new UserService({ multi: ['find'] }))
    app.service('users').create(subscription)
  })
  it('is ES module compatible', () => {
    expect(typeof Service).to.equal('function')
  })
  it('create the service', async () => {
    app.use('push', new Service({ vapidDetails, app }), {
      methods: ['create']
    })
    service = app.service('push')
    expect(service).toExist()
    expressServer = await app.listen(3333)
  })
  it('send webpush notifications', async () => {
    const response = await service.create({
      dataNotification: { title: 'title' },
      subscriptionService: 'users',
      subscriptionProperties: 'subscriptions'
    })
    expect(response).toExist()
    expect(response[0].statusCode).to.equal(201)
  })
  after(async () => {
    await expressServer.close()
  })
})
