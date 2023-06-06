import webpush from 'web-push'
import createDebug from 'debug'
import { BadRequest } from '@feathersjs/errors'
import _ from 'lodash'

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
    if (!data.subscriptionService) throw new BadRequest('feathers-webpush:create: expected missing \'data.serviceSubscription\' parameter')
    debug(`method 'create' called with 'dataNotification': ${data.dataNotification}, 'serviceSubscription': ${data.subscriptionService} and 'filterSubscription': ${data.subscriptionFilter}`)

    // Set data
    let { dataNotification, subscriptionService, subscriptionFilter = {} } = data
    if (!_.isEmpty(subscriptionFilter)) subscriptionFilter = { query: subscriptionFilter }

    // Retrieve and filter subscriptions service from specified service
    const subscriptionsService = await this.app.service(subscriptionService).find(subscriptionFilter)

    // Get all subscription information in array
    const subscriptions = []
    _.forEach(subscriptionsService, subscriptionService => {
      // Check if subscriptions key exists
      if (_.has(subscriptionService, 'subscriptions')) subscriptions.push(...subscriptionService.subscriptions)
    })

    // Send webpush notification for each subscription
    const webpushNotificationSend = []
    const webpushNotificationSendWithError = []
    for (const subscription of subscriptions) {
      // Check data subscription required
      if (!subscription.endpoint) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.endpoint\' parameter')
      if (!subscription.keys.auth) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.keys.auth\' parameter')
      if (!subscription.keys.p256dh) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.keys.p256dh\' parameter')
      // Send webpush notification
      try {
        const response = await webpush.sendNotification(subscription, JSON.stringify(dataNotification))
        webpushNotificationSend.push(response)
      } catch (error) {
        webpushNotificationSendWithError.push(error)
      }
    }

    return webpushNotificationSend
  }
}
