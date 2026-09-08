# User Frontend

## Build

```bash
npm install
npm run build
```

Build output is generated in `user/dist`.

## Dist Deployment

This frontend is configured for direct static deployment:

- Router uses HTML5 `history` mode, so URLs no longer include `#`.
- Vite `base` is `/`, so `dist` should be deployed at the site root.
- The server must rewrite non-file frontend routes to `index.html` for SPA navigation and page refresh.
- API base URL supports runtime override, so `dist` does not need to be rebuilt for every backend address change.

## Backend Connection

After building, edit `dist/runtime-config.js` on the server:

```js
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
  apiBaseUrl: 'https://your-api-domain.com/api',
}
```

Rules:

- If `apiBaseUrl` is empty, the frontend uses same-origin `/api/...`.
- If frontend and backend are reverse proxied under the same domain, keep it empty and proxy `/api` to the backend.
- If backend is on a separate domain or port, set the full API base URL explicitly.

## Upload/File URLs

When the backend returns paths like `/uploads/...`, the frontend will automatically resolve them against the backend origin derived from `apiBaseUrl`.
