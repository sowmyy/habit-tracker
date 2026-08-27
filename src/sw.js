// Custom service worker (vite-plugin-pwa injectManifest strategy).
// Precaches the app shell AND handles Web Push notifications.
import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST || [])

const APP_URL = '/habit-tracker/'

// Show the notification pushed by the server.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'HabiTracker', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'HabiTracker'
  const options = {
    body: data.body || '',
    icon: APP_URL + 'icons/icon-192.png',
    badge: APP_URL + 'icons/icon-192.png',
    vibrate: [80, 40, 80],
    data: { url: APP_URL },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Focus an existing tab or open the app when the notification is tapped.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of all) {
        if (client.url.includes('/habit-tracker') && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(APP_URL)
    })()
  )
})
