import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event: ExtendableEvent) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", function (event: FetchEvent) {
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
    return;
  }

  const response = fetch(event.request).then((response) => {
    if (response.status === 0) return response;

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
    newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

    return response.blob().then((blob) => {
      return new Response(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    });
  });

  event.respondWith(response);
});

precacheAndRoute(self.__WB_MANIFEST);
