
## provision web app kubernetes cluster on digital ocean

**(a) prerequisites: create fresh cluster, install local tools**  
1. sign up on digital ocean
1. create kubernetes cluster. defaults look good
1. follow instructions to install `doctl` and `kubectl` and `helm`
    - authenticate doctl with a token, and connect kubectl to your new cluster context
    - verify connection via `kubectl get namespace` to see standard kubernetes namespaces
1. use digitalocean's prefabricated 1-click installs!:
    - kubernetes monitoring stack
      - port forward and configure grafana, set password, save it somewhere
      - awesome!
    - ingress-nginx controller
      - boom done, fantastic

**(b) install standard web app infrastructure onto cluster**  

1. install cert-manager — standard helm install
    - run script `install-cert-manager`
1. install external-dns
    - sign up for cloudflare and set your domain's nameservers to cloudflare
    - generate a cloudflare api token, zone=read, dns=edit
    - run `install-external-dns-cloudflare XXXXXX`
      - replace `XXXXXX` with the cloudflare token

**(c) install**
1. create namespace for your app: `kubectl create namespace APPNAMESPACE`
    - replace `APPNAMESPACE` with the name of your app, lowercase, eg `metalshop`
1. generate a github token to read packages (read your docker images)
    - profile settings, developer settings, personal access tokens
    - create a new token with one permission: read packages
    - hold onto this token for next step
1. run script `install-github-secret APPNAMESPACE GITHUBUSER XXXXXX`
    - replace `APPNAMESPACE` with your app name, eg `metalshop`
    - replace `GITHUBUSER` with your github username, eg `chase-moskal`
    - replace `XXXXXX` with the github access token you generated
1. configure your app's deployments to include an entry in `imagePullSecrets`, like so
    ```yaml
    spec:

      # configure this field on all deployments pulling images from github
      imagePullSecrets:
      - name: dockerconfigjson-github-com

      # example for context
      containers:
      - name: your-container-name
        image: docker.pkg.github.com/<ORG>/<REPO>/<PKG>:<TAG>
    ```
