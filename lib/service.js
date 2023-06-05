import webpush from 'web-push'

export class Service {
  constructor(options) {
    // Check options
    if (!options) {
      throw new Error('feathers-webpush:constructor: `options` must be provided')
    }
    // Check app options
    if (!options.app) {
      throw new Error('feathers-webpush:constructor: `options.app` must be provided')
    }
    // Check webpush configuration
    if (!options.vapidKeys) {
      throw new Error('feathers-webpush:constructor: `options.vapidKeys` must be provided')
    }
    // Set vapid keys
    webpush.setVapidDetails(
      options.subject,
      options.vapidKeys.publicKey,
      options.vapidKeys.privateKey
    ),
    this.app = options.app
  }

  async create (data, params) {
    try {
      const { dataNotification, serviceSubscription, filterSubscription } = data

      // Retrieve and filter subscriptions service from specified service
      const subscriptionsService = await this.app.service(serviceSubscription).find({ query: filterSubscription })
      
      // Push notification
      for (const subscriptionService of subscriptionsService) {
        const subscription = { 
          endpoint: subscriptionService.endpoint, 
          keys: { 
            auth: subscriptionService.auth, 
            p256dh: subscriptionService.p256dh 
          }
        }
        await this.sendNotification(subscription, JSON.stringify(dataNotification))
      }
    } catch (error) {
      throw new Error('Failed to send push notifications')
    }
  } 

  async sendNotification(subscription, dataNotification) {
    try {
      // Send push notification
      await webpush.sendNotification(subscription, dataNotification)
    } catch (error) {
      throw new Error('Failed to send push notifications')
    }
  }
}