let click_open_url

self.addEventListener('push', (event) => {
  const push_message = event.data.json()
  click_open_url = push_message.url
  const options = {
    body: push_message.body,
    icon: push_message.icon,
    tag: 'simple-push-demo-notification'
  }
  event.waitUntil(self.registration.showNotification(push_message.title, options))
})

self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification
  clickedNotification.close()
  if (click_open_url) {
    const promiseChain = clients.openWindow(click_open_url)
    event.waitUntil(promiseChain)
  }
})
