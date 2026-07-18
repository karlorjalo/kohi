import { build, files, prerendered, version, base } from '$service-worker';

const CACHE = `kohi-${version}`;
// Dedupe: a path can appear in both `files` and `prerendered`
// (e.g. dialins.yaml), and cache.addAll rejects duplicate requests.
const ASSETS = [...new Set([...build, ...files, ...prerendered])];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		(async () => {
			const url = new URL(event.request.url);
			const cache = await caches.open(CACHE);

			// Precached app assets and pages: cache-first
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Everything else: network-first, falling back to cache when offline
			try {
				const response = await fetch(event.request);
				if (response.ok && url.protocol.startsWith('http')) {
					cache.put(event.request, response.clone());
				}
				return response;
			} catch (err) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
				if (event.request.mode === 'navigate') {
					const home = (await cache.match(`${base}/`)) ?? (await cache.match(base));
					if (home) return home;
				}
				throw err;
			}
		})()
	);
});
