let clickOpenUrl

self.addEventListener('push', (event) => {
  const pushMessage = event.data.json()
  clickOpenUrl = pushMessage.url
  const options = {
    body: pushMessage.body,
    icon: pushMessage.icon,
    tag: 'simple-push-demo-notification'
  }
  event.waitUntil(self.registration.showNotification(pushMessage.title, options))
})

self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification
  clickedNotification.close()
  if (clickOpenUrl) {
    const promiseChain = clients.openWindow(clickOpenUrl)
    event.waitUntil(promiseChain)
  }
})
