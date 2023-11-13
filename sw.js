// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// Add list of files to cache here.
const FILES_TO_CACHE = [
  './offline.html',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');

  evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
});

self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Fetch', evt.request.url);
    // Add fetch event handler here.
    if (evt.request.mode !== 'navigate') {
      // Not a page navigation, bail.
      return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
              return caches.open(CACHE_NAME)
                  .then((cache) => {
                    return cache.match('offline.html');
                  });
            })
    );
  });
  
const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

const saveSubscription = async (subscription) => {
    const response = await fetch('https://back-pwa.vercel.app/save-subscription', {
        method: 'post',
        headers: { 'Content-type': "application/json" },
        body: JSON.stringify(subscription)
    })

    return response.json()
}

self.addEventListener("activate", async (e) => {
    console.log("111");
    
    try {
        const subscription = await self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BP88K4wlPtmGx8nrjUt3YK7PI1XCT2Em6nldUEWEHoxlYXMmAiHQSLXRLXnECATYB9PadeIsEgXmKEA_rQZh7_Q")
        });

        const response = await saveSubscription(subscription);
        console.log("response", response);
    } catch (error) {
        console.error('Error during subscription:', error);
    }
});


self.addEventListener("push", e => {
    self.registration.showNotification("Wohoo!!", { body: e.data.text() })
})
