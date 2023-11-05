import feathers from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'
import express from '@feathersjs/express'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import makeDebug from 'debug'
import { deleteExpiredSubscriptions } from '../lib/index.js'

feathers.setDebug(makeDebug)

let app, expressServer
const endpoint = process.env.SUBSCRIPTION_TEST_ENDPOINT
const subscriptions = [{
  endpoint,
  keys: {
    auth: process.env.SUBSCRIPTION_TEST_KEY_AUTH,
    p256dh: process.env.SUBSCRIPTION_TEST_KEY_P256DH
  }
}]
const subscriptionService = 'users'
const subscriptionProperty = 'subscriptions'

class UserService extends MemoryService {}

describe('feathers-webpush:hooks', () => {
  before(async () => {
    chailint(chai, util)
    app = express(feathers())
    app.use(express.json())
    app.configure(express.rest())
    app.use(subscriptionService, new UserService({ id: '_id' }))
    app.service(subscriptionService).create({ subscriptions })
    expressServer = await app.listen(3333)
  })

  it('deleteExpiredSubscriptions', async () => {
    console.log(subscriptions)
    const hook = { type: 'after', app, result: { failed: [{ statusCode: 410, endpoint }], subscriptionService, subscriptionProperty } }
    await deleteExpiredSubscriptions(hook)
    const user = await app.service(subscriptionService).find()
    expect(user[0][subscriptionProperty]).to.deep.equal([])
  })

  after(async () => {
    await expressServer.close()
  })
})
