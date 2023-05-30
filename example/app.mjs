import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import { Service } from '../lib/service.js'

const port = process.env.PORT || 3333

// Create the Feathers app
const app = express(feathers())
// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Host the public folder
app.use('/', express.static('./public'))
// Serve feathers-webpush
app.use('/feathers-webpush', express.static('../lib'))
// Configure Socket.io
app.configure(socketio({ 
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8
}))

// Register the push service on the Feathers application
// /!\ do not forget to declare the custom methods
app.use('push', new Service())

// Start the server
app.listen(port).then(() => {
  console.log(`Feathers server listening on localhost:${port}`)
})