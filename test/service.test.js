import makeDebug from 'debug'
import feathers from '@feathersjs/feathers'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import express from '@feathersjs/express'
import { Service } from '../lib/index.js'

feathers.setDebug(makeDebug)

let app, service, expressServer

describe('feathers-webpush-service', () => {
  before(() => {
    chailint(chai, util)
    app = express(feathers())
    app.use(express.json())
    app.configure(express.rest())
  })
  it('is ES module compatible', () => {
    expect(typeof Service).to.equal('function')
  })
  it('create the service', async () => {
    app.use('push', new Service())
    service = app.service('push')
    expect(service).toExist()
    expressServer = await app.listen(3333)
  })
  after(async () => {
    await expressServer.close()
  })
})
