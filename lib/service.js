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
    if (!options.vapidDetails) throw new Error('feathers-webpush:constructor: `options.vapidDetails` must be provided')

    // Set vapid keys
    webpush.setVapidDetails(
      options.vapidDetails.subject,
      options.vapidDetails.publicKey,
      options.vapidDetails.privateKey
    )

    // Set application
    this.app = options.app
  }

  async create (data, params) {
    // check required data object
    if (!data.notification) throw new BadRequest('feathers-webpush:create: expected missing \'data.notification\' parameter')
    if (!data.subscriptionService) throw new BadRequest('feathers-webpush:create: expected missing \'data.subscriptionService\' parameter')
    if (!data.subscriptionProperty) throw new BadRequest('feathers-webpush:create: expected missing \'data.subscriptionProperty\' parameter')
    debug(`method 'create' called with subscription service ${data.subscriptionService}, subscription property ${data.subscriptionProperty} and subscription filter:`, data.subscriptionFilter)
    debug('method \'create\' called with notification payload:', data.notification)

    // Set data
    let { notification, subscriptionService, subscriptionProperty, subscriptionFilter = {} } = data
    _.isEmpty(subscriptionFilter) ? subscriptionFilter = { paginate: false } : subscriptionFilter = { paginate: false, query: subscriptionFilter }

    // Retrieve and filter subscriptions service from specified service
    const subscriptionsService = await this.app.service(subscriptionService).find(subscriptionFilter)

    // Get all subscription information in array
    const subscriptions = []
    _.forEach(subscriptionsService, subscriptionService => {
      // Check if subscriptionProperty exists
      if (_.has(subscriptionService, subscriptionProperty)) {
        const subscription = _.get(subscriptionService, subscriptionProperty)
        _.isArray(subscription) ? subscriptions.push(...subscription) : subscriptions.push(subscription)
      }
    })

    // Send webpush notification for each subscription
    const webpushNotificationSend = { succesful: [], failed: [], subscriptionService, subscriptionProperty }
    for (const subscription of subscriptions) {
      // Check data subscription required
      if (!subscription.endpoint) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.endpoint\' parameter')
      if (!subscription.keys.auth) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.keys.auth\' parameter')
      if (!subscription.keys.p256dh) throw new BadRequest('feathers-webpush:create: expected missing \'subscription.keys.p256dh\' parameter')
      // Send webpush notification
      try {
        const response = await webpush.sendNotification(subscription, JSON.stringify(notification))
        debug('webpush notification send:', subscription.endpoint)
        webpushNotificationSend.succesful.push(response)
      } catch (error) {
        webpushNotificationSend.failed.push(error)
        debug('error sending webpush notification:', subscription.endpoint)
      }
    }

    return webpushNotificationSend
  }
}
