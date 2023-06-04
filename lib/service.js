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

  async create (data) {
    try {
      const { dataNotification, serviceSubscription, filter } = data

      // Retrieve and filter subscriptions service from specified service
      const subscriptionsService = await this.app.service(serviceSubscription).find(filter)
      
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
      await webpush.sendNotification(subscription, dataNotification)
    } catch (error) {
      throw new Error('Failed to send push notifications')
    }
  }
}