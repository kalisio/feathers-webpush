import webpush from 'web-push'
import createDebug from 'debug'
import { BadRequest } from '@feathersjs/errors'

const debug = createDebug('feathers-webpush:service')

export class Service {
  constructor (options) {
    // Check options
    if (!options) throw new Error('feathers-webpush:constructor: `options` must be provided')

    // Check app options
    if (!options.app) throw new Error('feathers-webpush:constructor: `options.app` must be provided')

    // Check webpush configuration
    if (!options.vapidKeys) throw new Error('feathers-webpush:constructor: `options.vapidKeys` must be provided')

    // Set vapid keys
    webpush.setVapidDetails(
      options.subject,
      options.vapidKeys.publicKey,
      options.vapidKeys.privateKey
    )

    // Set application
    this.app = options.app
  }

  async create (data, params) {
    // check required data object
    if (!data.dataNotification) throw new BadRequest('feathers-webpush:create: expected missing \'data.dataNotification\' parameter')
    if (!data.serviceSubscription) throw new BadRequest('feathers-webpush:create: expected missing \'data.serviceSubscription\' parameter')
    debug(`method 'create' called with 'dataNotification': ${data.dataNotification}, 'serviceSubscription': ${data.serviceSubscription} and 'filterSubscription': ${data.filterSubscription}`)

    const { dataNotification, serviceSubscription, filterSubscription = null } = data

    // Retrieve and filter subscriptions service from specified service
    const subscriptionsService = await this.app.service(serviceSubscription).find({ query: filterSubscription })

    // Send webpush notification for each subscription
    for (const subscriptionService of subscriptionsService) {
      // check required subscriptionService
      if (!subscriptionService.endpoint) throw new BadRequest('feathers-webpush:create: expected missing \'subscriptionService.endpoint\' parameter')
      if (!subscriptionService.auth) throw new BadRequest('feathers-webpush:create: expected missing \'subscriptionService.auth\' parameter')
      if (!subscriptionService.p256dh) throw new BadRequest('feathers-webpush:create: expected missing \'subscriptionService.p256dh\' parameter')
      // Setup subscription params
      const subscription = {
        endpoint: subscriptionService.endpoint,
        keys: {
          auth: subscriptionService.auth,
          p256dh: subscriptionService.p256dh
        }
      }
      // Send webpush notification
      await this.sendNotification(subscription, JSON.stringify(dataNotification))
    }
  }

  async sendNotification (subscription, dataNotification) {
    // Send webpush notification
    const response = await webpush.sendNotification(subscription, dataNotification)
    // emit the event
    this.emit('webpush-send', response)
    return response
  }
}
