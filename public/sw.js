const SW_VERSION = "hfya-pwa-v1";
const SHELL_CACHE = `${SW_VERSION}-shell`;
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGE_CACHE = `${SW_VERSION}-pages`;

function getBasePath() {
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, "");
  return scopePath === "/" ? "" : scopePath;
}

function scopedPath(path) {
  const basePath = getBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return basePath ? `${basePath}${normalized}` : normalized;
}

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isProtectedPath(pathname) {
  return (
    pathname.startsWith(scopedPath("/portal/")) ||
    pathname.startsWith(scopedPath("/admin/")) ||
    pathname.startsWith(scopedPath("/auth/"))
  );
}

function isStaticAsset(pathname) {
  return /\.(?:css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(pathname);
}

async function putIfSuccessful(cacheName, request, response) {
  if (!response || !response.ok || response.type === "opaque") {
    return response;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

function buildSecureOfflineResponse() {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reconnect to continue</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f7f3ea; color: #17231f; }
      main { max-width: 34rem; margin: 0 auto; min-height: 100vh; display: grid; place-content: center; padding: 2rem; }
      .card { background: #fffdfa; border: 1px solid rgba(15, 91, 82, 0.12); border-radius: 24px; padding: 1.5rem; box-shadow: 0 18px 50px rgba(23, 35, 31, 0.08); }
      h1 { margin-top: 0; font-size: 1.6rem; }
      p { line-height: 1.6; margin-bottom: 0.85rem; }
      button { margin-top: 0.5rem; border: 0; border-radius: 999px; padding: 0.75rem 1.1rem; background: #0f5b52; color: #fff; font: inherit; cursor: pointer; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Reconnect to continue</h1>
        <p>Your secure portal content needs a live connection before it can open.</p>
        <p>Please check your internet connection and try again.</p>
        <button type="button" onclick="location.reload()">Try again</button>
      </div>
    </main>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll([
        scopedPath("/"),
        scopedPath("/offline/"),
        scopedPath("/manifest.webmanifest"),
        scopedPath("/icon.svg"),
        scopedPath("/icon-maskable.svg"),
      ]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![SHELL_CACHE, STATIC_CACHE, PAGE_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname.startsWith(scopedPath("/api/")) || url.pathname.startsWith(scopedPath("/_next/webpack-hmr"))) {
    return;
  }

  if (request.mode === "navigate") {
    if (isProtectedPath(url.pathname)) {
      event.respondWith(
        (async () => {
          try {
            return await fetch(request);
          } catch {
            const cached = await caches.match(request);
            return cached || buildSecureOfflineResponse();
          }
        })(),
      );
      return;
    }

    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => putIfSuccessful(PAGE_CACHE, request, response))
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) {
          return networkResponse;
        }

        return (await caches.match(scopedPath("/offline/"))) || buildSecureOfflineResponse();
      })(),
    );
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const response = await fetch(request);
        return putIfSuccessful(STATIC_CACHE, request, response);
      })(),
    );
  }
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "Healing From Your Addiction";
  const body = payload.body || "There is a new update waiting for you.";
  const targetUrl = payload.url || scopedPath("/");

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      badge: scopedPath("/icon.svg"),
      icon: scopedPath("/icon.svg"),
      data: {
        url: targetUrl.startsWith("http") ? targetUrl : scopedPath(targetUrl),
      },
      tag: payload.tag || "hfya-update",
      renotify: Boolean(payload.renotify),
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || scopedPath("/");

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
