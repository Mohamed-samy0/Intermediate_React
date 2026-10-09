# Mini SSR Shipment Tracker

## Run
```bash
npm install
npm run dev      # vite build + start server on http://localhost:3000
```
After you change client code (`src/`), run `npm run dev` again (it rebuilds).

Test data: `SWX-1001`, `SWX-1002`, `SWX-1003` (exist), `SWX-9999` (DB error), anything else (not found).

## Structure
- `server.js`        -> Fastify server (SSR logic goes here)
- `src/App.js`       -> shared component (runs on server AND browser)
- `src/client.js`    -> browser entry (hydration)
- `data/db.js`       -> fake slow database (don't edit)
- `index.html`       -> template with `<!--ssr-outlet-->` placeholder

## Suggested order
1. Req 1 + 2 + 4: basic page, button, SSR + hydration working
2. Req 3: local time without mismatch
3. Req 6: error handling (400 / 404 / 500)
4. Req 5: cache (LRU, max 100, TTL 30s)
5. Req 7: no state leaking between concurrent requests

## Acceptance checklist
- [ ] View Source shows full HTML, not an empty root
- [ ] No hydration warnings in the console
- [ ] Two concurrent requests for different users never see each other's data
- [ ] Cache never exceeds 100 items
- [ ] Cache entries refresh after 30 seconds (prove it with a log)
- [ ] 400 / 404 / 500 return real status codes (check in DevTools Network tab)

## Search keywords (hints only)
`renderToString`, `hydrateRoot`, `Fastify route params`, `reply.status`,
`window.__INITIAL_DATA__`, `serialize state in HTML XSS`, `useEffect runs only on client`,
`Map insertion order LRU`, `AsyncLocalStorage`
