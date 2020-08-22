
# how to continously deploy your web app to kubernetes like a boss

preamble: assumptions
- you are hosting your app on github
- you want to leverage github actions for continuous deployment to kubernetes cluster
- you want to use github packages as your docker image registry, because it's integration is built-in
- you choose digitalocean as your kubernetes provider, because it's easy and cheap and magic
- you choose cloudflare for dns because it's easy and magic, and cdn, and ddos-protection

# prepare a kubernetes cluster

## (a) prerequisites: create fresh cluster, install local tools
1. sign up on digitalocean
1. create kubernetes cluster. name it something cool. defaults look good, feels good man
1. create a directory on your computer to save super sneaky-beaky secrets, passwords, tokens, etc
1. follow instructions to install `doctl` and `kubectl` and `helm`
    - authenticate `doctl` by logging in or whatever you do
    - set your kubectl context by running `doctl kubernetes cluster kubeconfig save CLUSTERNAME`
      - replace `CLUSTERNAME` with your cool cluster name
    - verify connection via `kubectl get namespace` to see standard kubernetes namespaces
    - *high five*
1. use digitalocean's prefabricated 1-click installs!
    - kubernetes monitoring stack - click to install
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
    - ingress-nginx controller - click to install
      - *boom done, fantastic!*

## (b) install standard web app infrastructure onto cluster

1. cd into this cluster-tutorial directory, so you can run the scripts
1. install cert-manager: run `./install-cert-manager`
1. install external-dns
    - sign up for cloudflare and set your domain's nameservers to cloudflare
    - generate a cloudflare api token, zone=read, dns=edit, save to your sneaky dir
    - run `./install-external-dns-cloudflare XXXXXX proxy`
      - replace `XXXXXX` with the cloudflare token
      - remove `proxy` at the end to disable cloudflare proxy

## (c) prepare your application for continuous deployment

1. create a namespace for your app: `kubectl create namespace APPNAME`
    - replace `APPNAME` with the lowercase name of your app, eg `metalshop`
1. download your cluster's kubeconfig file from digitalocean, and paste the contents as github secret `STAGE_KUBECONFIG`
1. sign up for dockerhub, and set `DOCKER_USERNAME` and `DOCKER_PASSWORD` as secrets on your git repo

more coming soon..?

<!--
**(c) allow your app to pull your images from github packages**
1. ***if*** you are using the github packages docker registry
    - github packages requires your cluster to authorize to pull images
    - generate a github token to read packages
      - profile settings, developer settings, personal access tokens
      - create a new token with one permission: read packages
      - hold onto this token for next step
    - run script `install-github-secret APPNAMESPACE GITHUBUSER XXXXXX`
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
-->
