import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import { Service } from '../lib/service.js'
import _ from 'lodash'

const port = process.env.PORT || 3333

// Create the Feathers app
const app = express(feathers())

// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Host the public folder
app.use('/', express.static('./public'))

// Configure Socket.io
app.configure(socketio({ 
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8
}))

// Configure subscription service
class SubscriptionService {
  constructor () {
    this.subscriptions = []
  }
  async find (params) {
    if (_.isEmpty(params.query)) return this.subscriptions
    return _.find(this.subscriptions, (subscription) => {
      return params.query.id ? subscription.id === params.query.id : subscription.endpoint === params.query.endpoint
    })
  }
  async create (data, params) {
    // Check if subscription already exists
    let subscription = _.find(this.subscriptions, { endpoint: data.endpoint })
    if (subscription) return new Error('This subscription already exists')
    // Create subscription
    this.subscriptions.length === 0 ? subscription = { ...data, id: 0 } : subscription = { ...data, id: _.last(this.subscriptions).id +1 }
    this.subscriptions.push(subscription)
  }
  async remove (id, params) {
    const subscriptions = _.filter(this.subscriptions, subscription => subscription.id !== id)
    this.subscriptions = subscriptions
  }
}
app.use('subscriptions', new SubscriptionService())

// Define the options used to instanciate the webpush service
const options = {
  vapidKeys: {
    publicKey: process.env.PUBLIC_VAPID_KEY,
    privateKey: process.env.PRIVATE_VAPID_KEY
  },
  subject: process.env.SUBJECT,
  app: app
}

// Register webpush service on the Feathers application
// /!\ do not forget to declare the custom methods
app.use('push', new Service(options), {
  methods: ['create']
})

// Start the server
app.listen(port).then(() => {
  console.log(`Feathers server listening on localhost:${port}`)
})