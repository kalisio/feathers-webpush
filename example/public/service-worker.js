let clickOpenUrl

self.addEventListener('push', (event) => {
  const pushOptions = event.data.json()
  clickOpenUrl = pushOptions.url
  // Show notification
  event.waitUntil(self.registration.showNotification(pushOptions.title, pushOptions))
})

self.addEventListener('notificationclick', (event) => {
  // Close notification if clicked
  event.notification.close()
  // Open window on the specified url
  if (clickOpenUrl) {
    const promiseChain = clients.openWindow(clickOpenUrl)
    event.waitUntil(promiseChain)
  }
})