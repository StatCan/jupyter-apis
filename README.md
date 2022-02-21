[(Français)](#interface-de-programmation-dapplications-jupyter)

# Jupyter Application Programming Interfaces

A Golang replacement for the **[Kubeflow][kubeflow]** Jupyter Web APIs.

## How to Contribute

See **[CONTRIBUTING.md](CONTRIBUTING.md)**

## Development Environment

### Run API Server

The API server will connect to the Kubeflow cluster from your current `kubectl`
context. See _Connecting a Kubeflow cluster_ below for options.

1. Install **[Go][go]**
2. Change directory to project root: `cd jupyter-apis`
3. Run `go run . -spawner-config samples/spawner_ui_config.yaml`

### Run Front-End

The front-end is configured to proxy requests to the local API server. It
requires an environment variable (`KF_USER_ID`) to specify the current user –
this is passed to the API server as an HTTP header.

1. Change directory to front-end folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the front-end `KF_USER_ID=<cloud_email> npm start`

The front-end is now available at `http://localhost:4200/jupyter/`. Since it is
disconnected from the `centraldashboard` component, you need to type your
desired namespace in the UI rather than selecting it from a dropdown.

### Connecting a Kubeflow Cluster

The API server will connect to the Kubeflow cluster from your current `kubectl`
context. Here are a couple options for setting that up.

#### Local MiniKF Cluster

This deploys a Kubeflow cluster on your local machine and requires at least 50GB
of disk space and the recommanded RAM is 12 Gb. First, create the miniKF cluster:

1. Install Vagrant and Virtual Box.
2. Create a new directory and run `vagrant init arrikto/minikf` and then
   `vagrant up` (takes about 20 minutes to boot).
3. Navigate to `http://10.10.10.10`.
4. Follow on-screen steps to start Kubeflow and Rok (takes about another 20 minutes).
5. From here, you can use Kubeflow and Rok.

Then configure `kubectl` to connect to your new cluster:

1. Download the miniKF `kubectl` config file from `http://10.10.10.10`.
2. Use the downloaded configuration for `kubectl`, either replacing, or merging
   it into, `~/.kube/config`.
3. Ensure `kubectl config current-context` is pointing to your local cluster.

Your `KF_USER_ID` can be the default user that was created for your miniKF
cluster (typically `user`).

Each time you need to start the cluster, navigate to the directory you created
and run `vagrant up`.

> **Note**: after some experimentation, it was found that the vagrant file could be modified on line 57 to use 8gb instead of the default 12.

```rb
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    #vb.gui = true

    # Customize the amount of memory on the VM:
    vb.memory = "8192"
  end
```

#### Remote AKS Cluster

1. Install Azure CLI `az` and `kubectl`
2. Login with `az` and set your subscription
3. Run `az aks get-credentials` for the desired remote cluster
4. Ensure `kubectl config current-context` is pointing to correct cluster

[go]: https://golang.org/dl/
[kubeflow]: https://github.com/kubeflow/kubeflow
