
## provision kubernetes cluster on digital ocean

**(a) create fresh cluster**  
1. sign up on digital ocean
1. create kubernetes cluster. defaults look good
1. follow instructions to install `doctl` and `kubectl` and `helm`
    - authenticate doctl with a token, and connect kubectl to your new cluster context
    - verify connection via `kubectl get namespace` to see standard kubernetes namespaces

**(b) install goodies onto cluster**  
1. install nginx ingress controller — standard helm install
1. install cert-manager — standard helm install
1. install external-dns
    - sign up for cloudflare and set your domain's nameservers to cloudflare
    - generate a cloudflare api token, zone=read, dns=edit
    - follow external-dns install instructions
1. prepare the cluster for your app
    - create namespace for your app, eg `kubectl create namespace metalshop`
    - follow these [ridonculous stackoverflow instructions](https://stackoverflow.com/questions/61912589/how-can-i-use-github-packages-docker-registry-in-kubernetes-dockerconfigjson) to link kubernetes to your github packages registry
