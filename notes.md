
- feature.farm repo, public
  - core restructuring and finish core auth logic
  - frontend demo works with mocks
  - `master` deploys demo to gh-pages on https://dev.feature.farm
  - `release` publishes `featurefarm` to npm
- feature.service repo, private (dockerized microservices with helm deployments)
  - `master` deploys to https://stage.feature.farm
  - `release` deploy to https://feature.farm

```
FEATURES
  auth/
    auth-api.ts
      appsTopic
        .listApps()
        .registerApp()
        .deleteApp()
        .createAppToken()
        .deleteAppToken()
      authTopic
        .authenticateViaPasskey()
        .authenticateViaGoogle()
        .authorize()
      userTopic
        .getUser()
        .setUserProfile()
  admin/
    admin-api.ts
      permissionsTopic
        .list()
        .setRole()
  liveshow/
    liveshow-api.ts
      liveshowTopic
        .getShow()
        .setShow()
  payments/
    payments-api.ts
      paymentsTopic
        .
```
