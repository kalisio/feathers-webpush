import { FeathersError } from '@feathersjs/errors'
import _ from 'lodash'

class PermissionDeniedNotifications extends FeathersError {
  constructor (message, data) {
    super(message, 'PermissionDeniedNotifications', 499, 'permission-denied-notifications', data)
  }
}

class NotificationsNotSupported extends FeathersError {
  constructor (message, data) {
    super(message, 'NotificationsNotSupported', 498, 'notifications-not-supported', data)
  }
}

class ServiceWorkerNotRegistered extends FeathersError {
  constructor (message, data) {
    super(message, 'ServiceWorkerNotRegistered', 497, 'service-worker-not-registered', data)
  }
}

export async function checkPrerequisites () {
  // Check push manager support
  if (!('PushManager' in window)) throw new NotificationsNotSupported('Push isn\'t supported on this browser')
  // Check notification support
  if (!('Notification' in window)) throw new NotificationsNotSupported('This browser does not support notifications')
}

export async function requestNotificationPermission () {
  // Check notification permissions
  if (window.Notification.permission === 'default') {
    try {
      // Ask the user for permission
      return await window.Notification.requestPermission()
    } catch (err) {
      throw new PermissionDeniedNotifications('Denied permission to send notifications')
    }
  } else if (window.Notification.permission === 'denied') throw new PermissionDeniedNotifications('Denied permission to send notifications')
}

export async function getPushSubscription () {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    throw new ServiceWorkerNotRegistered('Service worker not registered')
  }
  return registration.pushManager.getSubscription()
}

export async function subscribePushNotifications (publicVapidKey) {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicVapidKey
  })
  // Convert the subscription key of an ArrayBuffer into a string
  return JSON.parse(JSON.stringify(subscription))
}

export async function unsubscribePushNotifications () {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration.pushManager.getSubscription()
  await subscription.unsubscribe()
  return subscription
}

export async function addSubscription (subscription, currentSubscription, subscriptionProperty) {
  if (_.has(subscription, subscriptionProperty)) {
    if (_.find(_.get(subscription, subscriptionProperty), subscription => subscription.endpoint === currentSubscription.endpoint)) {
      return _.get(subscription, subscriptionProperty)
    } else {
      return _.get(subscription, subscriptionProperty).push(currentSubscription)
    }
  } else {
    return _.set(subscription, subscriptionProperty, [currentSubscription])
  }
}

export async function removeSubscription (subscription, currentSubscription, subscriptionProperty) {
  return _.set(subscription, subscriptionProperty, _.filter(_.get(subscription, subscriptionProperty, []), subscription => subscription.endpoint !== currentSubscription.endpoint))
}
