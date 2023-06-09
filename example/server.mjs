import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import { MemoryService } from '@feathersjs/memory'
import { Service } from '../lib/service.js'
import _ from 'lodash'

const port = process.env.PORT || 8081

// Create the Feathers app
const app = express(feathers())

// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure Socket.io
app.configure(socketio({ 
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8
}))

// Configure user service
class UserService extends MemoryService {}
app.use('users', new UserService({ multi: ['remove'] }))

// Define the options used to instanciate the webpush service
const options = {
  vapidDetails: {
    subject: process.env.VAPID_SUBJECT,
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  },
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