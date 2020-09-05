
# how to continously deploy your web app to kubernetes like a boss

goals
- provision a brand-new kubernetes cluster, on digitalocean
- setup github actions to continuously deploy images and push helm upgrades

assumptions
- your app source is on github
- your've dockerized your microservices, including an nginx web server
- you've written a helm chart
- you're cool with publishing/pulling public images on dockerhub
- you're cool with publishing/pulling private images on github packages

prerequisite steps
1. set your domains' nameservers to cloudflare for dns hosting and cdn proxy
1. create a directory on a secure machine, to save super sneaky-beaky secrets, passwords, tokens, etc
1. cd into this tutorial directory to run scripts

## provision a kubernetes cluster

### (a) create fresh cluster
1. sign up on digitalocean
1. create kubernetes cluster. name it something cool

### (b) install local tools
1. follow the digitalocean instructions to install `doctl` and `kubectl` and `helm`
    - authenticate with `doctl`
    - set your kubectl context by running `doctl kubernetes cluster kubeconfig save CLUSTERNAME`
      - replace `CLUSTERNAME` with your cool cluster name
    - verify connection via `kubectl get namespace` to see standard kubernetes namespaces
    - *high five*

### (c) use digitalocean's prefabricated 1-click installs!
1. kubernetes monitoring stack - click to install
    - log into grafana and set it up
    - run `kubectl -n prometheus-operator get pods | grep prometheus-operator-grafana`
    - copy the pod name
    - run `kubectl port-forward POD_NAME_HERE -n prometheus-operator 9080:3000`
      - replace POD_NAME_HERE with the pod name
    - visit http://localhost:9080/ and login as `admin` / `prom-operator`
    - update password, write down in your sneaky-beaky dir
    - dashboards, manage, select compute resources cluster, star it
    - profile settings, set ui dark mode, and default dashboard to the one you starred
    - *neato!*
1. ingress-nginx controller - click to install
    - *boom done, fantastic!*

### (c) install standard web app infrastructure onto cluster

1. install cert-manager: run `./install-cert-manager`
1. install external-dns, and configure it with cloudflare
    - sign up for cloudflare and set your domain's nameservers to cloudflare
    - generate a cloudflare api token, zone=read, dns=edit, save to your sneaky dir
    - run `./install-external-dns-cloudflare XXXXXX proxy`
      - replace `XXXXXX` with the cloudflare token
      - remove `proxy` at the end to disable cloudflare proxy

## setup your continuous deployment pipeline

1. create a namespace for your app: `kubectl create namespace APPNAME`
    - replace `APPNAME` with the lowercase name of your app, eg `metalshop`

1. if you need source ips for whitelisting to work
    - go into digitalocean web ui and find your load balancer
    - set loadbalancer "proxy protocol" to "true"

1. give build agent permission to perform the helm upgrade
    - download your cluster's kubeconfig file from digitalocean, and paste the contents as github secret `STAGE_KUBECONFIG`

1. wire up each docker image registry
    1. ***if*** you're using dockerhub *(probably for public images)*
        - sign up for dockerhub
        - *allow the github build agent to publish images:* set github secrets on your app's repo, `DOCKER_USERNAME` and `DOCKER_PASSWORD` as secrets on your git repo
    1. ***if*** you're using github packages *(for private images)*
        - github packages requires your cluster to authorize all image pulls
        - generate a github token to read packages
          - profile settings, developer settings, personal access tokens
          - create a new token with one permission: read packages
          - hold onto this token for next step
        - run script `./install-github-secret APPNAMESPACE GITHUBUSER XXXXXX`
          - replace `APPNAMESPACE` with your app namespace, eg `metalshop`
          - replace `GITHUBUSER` with your github username, eg `chase-moskal`
          - replace `XXXXXX` with the github access token you generated
        - configure your app's deployments to include an entry in `imagePullSecrets`, like so
          ```yaml
          spec:

            # configure this field on all deployments pulling images from github
            imagePullSecrets:
            - name: dockerconfigjson-github-com

            # just example for context
            containers:
            - name: your-container-name
              image: docker.pkg.github.com/<ORG>/<REPO>/<PKG>:<TAG>
          ```
