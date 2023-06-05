import webpush from 'web-push'

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
    try {
      // check required data object
      if (!data.dataNotification) throw new Error('feathers-webpush:create: expected missing \'data.dataNotification\' parameter')
      if (!data.serviceSubscription) throw new Error('feathers-webpush:create: expected missing \'data.serviceSubscription\' parameter')

      const { dataNotification, serviceSubscription, filterSubscription = null } = data

      // Retrieve and filter subscriptions service from specified service
      const subscriptionsService = await this.app.service(serviceSubscription).find({ query: filterSubscription })

      // Send webpush notification for each subscription
      for (const subscriptionService of subscriptionsService) {
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
    } catch (error) {
      throw new Error('Failed to send webpush notifications')
    }
  }

  async sendNotification (subscription, dataNotification) {
    try {
      // Send webpush notification
      await webpush.sendNotification(subscription, dataNotification)
    } catch (error) {
      throw new Error('Failed to send webpush notifications')
    }
  }
}
