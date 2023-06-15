import _ from 'lodash'

export async function checkPrerequisites () {
  // Check serviceWorker support
  if (!('serviceWorker' in navigator)) throw new Error('This browser does not support service worker')
  // Check push manager support
  if (!('PushManager' in window)) throw new Error('Push isn\'t supported on this browser')
  // Check notification support
  if (!('Notification' in window)) throw new Error('This browser does not support notifications')
  // Check notification permissions
  if (window.Notification.permission === 'denied') throw new Error('Denied permission to send notifications')
  return true
}

export async function requestNotificationPermission () {
  // Ask the user for permission
  if (window.Notification.permission !== 'denied') {
    try {
      return await window.Notification.requestPermission()
    } catch (err) {
      throw new Error('Denied permission to send notifications', err)
    }
  }
}

export async function getPushSubscription () {
  const registration = await navigator.serviceWorker.ready
  return await registration.pushManager.getSubscription()
}

export async function subscribePushNotifications (publicVapidKey) {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicVapidKey
  })
  return JSON.parse(JSON.stringify(subscription))
}

export async function unsubscribePushNotifications () {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration.pushManager.getSubscription()
  await subscription.unsubscribe()
  return subscription
}

export async function addSubscription (user, currentSubscription, subscriptionProperty) {
  if (_.has(user, subscriptionProperty)) {
    if (_.find(_.get(user, subscriptionProperty), subscription => subscription.endpoint === currentSubscription.endpoint)) {
      return _.get(user, subscriptionProperty)
    } else {

      return _.get(user, subscriptionProperty).push(currentSubscription)
    }
  } else {
    return _.set(user, subscriptionProperty, [currentSubscription])
  }
}

export async function removeSubscription (user, currentSubscription, subscriptionProperty) { 
  return _.set(user, subscriptionProperty, _.filter(_.get(user, subscriptionProperty, []), subscription => subscription.endpoint !== currentSubscription.endpoint))
}