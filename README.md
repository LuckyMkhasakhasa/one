# one

Playwright + TypeScript test framework built around page objects.

## Structure

```
src/
  config/Env.ts              typed environment configuration
  core/                      base classes
    BasePage.ts              goto / reload / waitUntilLoaded / title
    BaseComponent.ts         UI fragment scoped to a root locator
    BaseApiClient.ts         generic REST CRUD client
  api/PostsClient.ts         BaseApiClient<Post>
  pages/                     saucedemo page objects (extend BasePage)
  workbench/
    pages/                   WorkbenchLoginPage, WorkbenchHomePage
    components/              NavigationMenu, UserMenu
    fixtures.ts              Workbench fixtures (pages, credentials, pageErrors)
  fixtures.ts                saucedemo + API fixtures
tests/
  api/  ui/                  saucedemo + jsonplaceholder suites
  workbench/
    auth.setup.ts            signs in once and saves storage state
    public/                  login + session tests (start signed out)
    authenticated/           home + navigation tests (reuse saved session)
```

## Vitality Drive Workbench

Copy `.env.example` to `.env` and set:

```
WORKBENCH_BASE_URL=https://uat.vitalitydrive.com/vitality-drive-workbench/
WORKBENCH_USER=<username>
WORKBENCH_PASSWORD=<password>
```

Run:

```
npm run test:workbench
```

Coverage: login form rendering, masking, mobile viewport, valid sign-in
(button and Enter), rejected sign-ins (wrong/unknown/case/whitespace/SQL
injection/empty fields), recovery after a failed attempt, credentials never in
the URL, cookie Secure/HttpOnly flags, logout, post-logout protection (direct
URL, back button, cleared cookies), session persistence across reload and tabs,
signed-in user display, script and 5xx error checks, and a crawl of every
internal navigation link.
