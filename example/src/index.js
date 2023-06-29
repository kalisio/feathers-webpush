import socketio from '@feathersjs/socketio-client'
import { feathers } from '@feathersjs/feathers'
import io from 'socket.io-client'
import {
  checkPrerequisites, 
  getPushSubscription, 
  subscribePushNotifications,
  unsubscribePushNotifications, 
  requestNotificationPermission
} from '../../lib/client'

// Vapid public key
const publicVapidKey = '' 

// Create the client Feathers app
const api = feathers()
// Configure the transport using socket.io
const socket = io('http://localhost:8081')
const transport = socketio(socket)
api.configure(transport)

// Functions
async function registerServiceWorker () {
  // Check for serviceWorker on navigator
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service worker successfully registered')
    } catch(err) {
      new Error('ServiceWorker registration failed: ', err)
    }
  }
}
async function isSubscribed () {
  try {
    await checkPrerequisites()
    console.log('All prerequisites are valid')
  } catch (err) {
    console.log(err)
  }
  // Check subscription to web push notifications
  const subscription = getPushSubscription()
  if (subscription) {
    // Check if the subscription is in database
    const users = await api.service('users').find({ query: { endpoint: subscription.endpoint }})
    if (users.length === 0) {
      document.getElementById('isSubscribed').innerHTML = 'You must subscribe to receive notifications !'
      document.getElementById('btnSubscribe').className = ''
      document.getElementById('btnPush').className = 'hide'
      document.getElementById('btnUnsubscribe').className = 'hide'
    } else {
      console.log ( 'You are subscribed :' , subscription )
      document.getElementById('isSubscribed').innerHTML = 'You are subscribed !'
      document.getElementById('btnSubscribe').className = 'hide'
      document.getElementById('btnPush').className = ''
      document.getElementById('btnUnsubscribe').className = ''
    }
  } else {
    document.getElementById('isSubscribed').innerHTML = 'You must subscribe to receive notifications !'
    document.getElementById('btnSubscribe').className = ''
    document.getElementById('btnPush').className = 'hide'
    document.getElementById('btnUnsubscribe').className = 'hide'
  }
}
window.subscribe = async () => {
  // Check notification permission
  try {
    await requestNotificationPermission()
  } catch (err) {
    console.log(err)
  }
  // Subscribe to web webpush notifications
  const subscription = await subscribePushNotifications(publicVapidKey)
  // Create subscription
  api.service('users').create({
    subscriptions: [{
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh
      }
    }]
  })
  // Update page
  document.getElementById('isSubscribed').innerHTML = 'You are subscribed !'
  document.getElementById('btnSubscribe').className = 'hide'
  document.getElementById('btnPush').className = ''
  document.getElementById('btnUnsubscribe').className = ''
  console.log('Webpush subscription registered: ', subscription)
}
window.unsubscribe = async () => {
  // Unsubscribe from web webpush notifications
  const subscription = unsubscribePushNotifications()
  // Remove subscription
  api.service('users').remove(null, { query: { endpoint: subscription.endpoint }})
  // Update page
  document.getElementById('isSubscribed').innerHTML = 'You must subscribe to receive notifications !'
  document.getElementById('btnSubscribe').className = ''
  document.getElementById('btnPush').className = 'hide'
  document.getElementById('btnUnsubscribe').className = 'hide'
  console.log('Unsubscribing to web push notifications')
}
window.sendNotification = async () => {
  // Setup notification params
  const dataNotification = {
    title: 'feathers-webpush example title',
    body: 'feathers-webpush example body',
    icon: 'https://s3.eu-central-1.amazonaws.com/kalisioscope/kalisio/kalisio-icon-256x256.png',
    url: 'https://kalisio.com/'
  }
  // Send webpush notification
  api.service('push').create({
    dataNotification: dataNotification, 
    subscriptionService: 'users',
    subscriptionProperty: 'subscriptions'
  })
}

// Immediate
registerServiceWorker()
isSubscribed()