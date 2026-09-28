# one
Playwright API tests (jsonplaceholder) and UI tests (saucedemo).

```bash
npm ci
npx playwright install chromium
npm test            # all tests
npm run test:api    # API only
npm run test:ui     # UI only
npm run typecheck
```

On macOS 12, Playwright can't download Chromium or ffmpeg. Use your installed Google Chrome and turn off video recording:

```bash
PW_CHANNEL=chrome PW_NO_VIDEO=1 npm test
```

(or set both in `.env` — see `.env.example`).

## Vitality Drive Workbench (UAT)

`npm run test:vitality` runs read-only login and driver-search tests against the Workbench. They need `VD_USER` and `VD_PASSWORD` in `.env` and are skipped otherwise. Tests run one at a time because they share one UAT account.
