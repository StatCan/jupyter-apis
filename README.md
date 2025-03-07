[(Français)](#interface-de-programmation-dapplications-jupyter)

# Jupyter Application Programming Interfaces

A Golang replacement for the **[Kubeflow][kubeflow]** Jupyter Web APIs.

## How to Contribute

See **[CONTRIBUTING.md](CONTRIBUTING.md)**

## Development Environment
***Note that the frontend will report errors when calling `/api/namespaces` when run locally. This***
***issue does not arise in production, as the `/api/namespaces` endpoint is unused.***

To initialize the `.env` file for the development environment, use `task env`.
You will need to fill out your kubeflow cloud account and kubeflow namespace information manually.
The `thunder-tests` folder contains configuration for testing requests against the backend. Use the `vscode`
`THUNDER CLIENT` extension to load the tests.

### Run API Server

The API server will connect to the Kubeflow cluster from your current `kubectl`
context. See _Connecting a Kubeflow cluster_ below for options.

1. Install **[Go][go]**
2. Change directory to project root: `cd jupyter-apis`
3. Run `go run . -spawner-config samples/spawner_ui_config.yaml`

Alternatively,

1. `task go:dev -w -- -spawner-config samples/spawner_ui_config.yaml` will live-reload the Go server upon changes.

_Recommended_

You can use the vscode debugger to run the backend, just copy the below contents to a file at path `.vscode/launch.json`.
```json
{
  "version": "0.2.0",
  "configurations": [
      {
          "name": "Debug jupyter-api backend",
          "type": "go",
          "request": "launch",
          "mode": "debug",
          "program": ".",
          "args": [
              "-spawner-config",
              "samples/spawner_ui_config.yaml",
          ],
          "envFile": "${workspaceFolder}/.env"
      }
  ]
}
```

### Run Front-End

The front-end is configured to proxy requests to the local API server. It
requires an environment variable (`KF_USER_ID`) to specify the current user –
this is passed to the API server as an HTTP header.

The following can be pasted in a script and executed. This uses the latest node lts/hydrogen version(v18.19.0) with npm v8(10.2.3).
**NOTE**: `user` is when using vagrant. Use the email adress if it is the dev cluser (please never connect to prod directly)

```
cd frontend/common/kubeflow-common-lib
npm i
npm run build
npm link ./dist/kubeflow

cd ../../jupyter
npm i
npm link kubeflow
KF_USER_ID=user npm start
```

For the kubecost data to be retrievable when running locally, the following will need to be executed `kubectl port-forward -n kubecost-system deployment/kubecost-cost-analyzer 9090`

### Testing backend Rest API

To test the backend, install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or search for REST Client directly from the Extensions tab in VS Code

After being installed, open the `rest-test\restclient.http` file.

Click on the Send Request link that appears above the request or press Ctrl+Alt+R to send the request.

The response will appear in the Response window at the bottom of VS Code.

After sending the request, the Response section will display the following details:

- Status Code: The HTTP status code of the response (e.g., 200, 404, etc.).
- Response Body: The body of the API response (e.g., JSON data, error messages).
- Headers: The response headers from the API.

Some requests require certain parameters to have values. Those can be done by updating the variables in the `rest-test\restclient.http` file.

### Running intergration tests

We use [Cypress](https://www.cypress.io/) to make our end-to-end tests.
To run integration tests locally, first make sure that the jupyter-apis app is up and running. Then, from the `jupyter-apis/frontend/jupyter` directory, run either `npm run ui-test` to open the Cypress UI, or `npm run ui-test-ci` to run the cypress tests just in the terminal.

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
4. Follow on-screen steps to start Kubeflow (takes about another 20 minutes).
5. From here, you can use Kubeflow.

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


## On platform testing

Any push to an open PR that has the auto-deploy label on it allows developers to opt-in to on-platform testing. For example, when you need to build in github and test on platform (or want someone else to be able to pull your image):
1. open a PR and add the auto-deploy label
2. push to your PR and watch the GitHub Action CI
3. access your image in Kubeflow DEV via a custom image from any of:
    - k8scc01covidacrdev.azurecr.io/IMAGENAME:SHA
    - k8scc01covidacrdev.azurecr.io/IMAGENAME:SHORT_SHA

## Whats Different?

Routes are defined in this repository [here](./main.go).

[Upstream](https://github.com/kubeflow/kubeflow/tree/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes), the endpoints are structures via request type (e.g. `GET`, `PUT`, `DELETE`).

_Note_

- _that not all endpoints are included in the golang implementation_
- _to find the upstream endpoint, load the [Upstream](https://github.com/kubeflow/kubeflow/tree/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes)
  and use search with the endpoint text!_

| Request Type | Golang Endpoint | Upstream Python Endpoint | Purpose |
| --- | --- | --- | --- |
| GET | /api/config | [/api/config](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L13) | Gets the spawner_ui_config.yaml |
| GET | /api/gpus | [/api/gpus](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L101) | Reads the GPU vendors from the spawner config |
| GET | /api/storageclasses | [/api/storageclasses](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/common/backend/kubeflow/kubeflow/crud_backend/routes/get.py#L18) | list all storageclasses |
| GET | /api/storageclasses/default | [/api/storageclasses/default](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/common/backend/kubeflow/kubeflow/crud_backend/routes/get.py#L26) | gets the storage class with the `is-default-class` annotation |
| GET | /api/namespaces/{namespace}/cost/allocation | Not found | Get the kubecost Allocation API |
| GET | /api/namespaces | [/api/namespaces](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/common/backend/kubeflow/kubeflow/crud_backend/routes/get.py#L10) | Get the list of namespaces |
| GET | /api/namespaces/{namespace} | Not found | Get namespace metadata |
| GET | /api/namespaces/{namespace}/notebooks | [/api/namespaces/\<namespace\>/notebooks](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L52) | Get the list of notebooks |
| POST | /api/namespaces/{namespace}/notebooks | [/api/namespaces/\<namespace\>/notebooks](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/default/routes/post.py#L11) | Create a notebook |
| GET | /api/namespaces/{namespace}/notebooks/{notebook} | [/api/namespaces/\<namespace\>/notebooks/\<name\>](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L59) | Get a notebook |
| GET | /api/namespaces/{namespace}/notebooks/{notebook}/pod | [/api/namespaces/\<namespace\>/notebooks/\<notebook_name\>/pod](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L64) | Gets pod of notebook |
| GET | /api/namespaces/{namespace}/notebooks/{notebook}/pod/{pod_name}/logs | [/api/namespaces/\<namespace\>/notebooks/\<notebook_name\>/pod/\<pod_name\>/logs](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L81) | Gets logs of pod of notebook |
| GET | /api/namespaces/{namespace}/notebooks/{notebook}/events | [/api/namespaces/\<namespace\>/notebooks/\<notebook_name\>/events](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L90) | Gets events of notebook |
| DELETE | /api/namespaces/{namespace}/notebooks/{notebook} | [/api/namespaces/\<namespace\>/notebooks/\<notebook\>](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/delete.py#L9) | Delete a notebook |
| PATCH | /api/namespaces/{namespace}/notebooks/{notebook} | [/api/namespaces/\<namespace\>/notebooks/\<notebook\>](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/patch.py#L19) | Update a notebook |
| GET | /api/namespaces/{namespace}/pvcs | [/api/namespaces/\<namespace\>/pvcs](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/volumes/backend/apps/default/routes/get.py#L9) | List `PVC`s |
| GET | /api/namespaces/{namespace}/pvcs/{pvc} | [/api/namespaces/\<namespace\>/pvcs/\<pvc_name\>](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/volumes/backend/apps/default/routes/get.py#L19) | Gets a `PVC` |
| DELETE | /api/namespaces/{namespace}/pvcs/{pvc} | [/api/namespaces/\<namespace\>/pvcs/\<pvc\>](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/volumes/backend/apps/default/routes/delete.py#L11) | Delete a `PVC` |
| GET | /api/namespaces/{namespace}/pvcs/{pvc}/pods | [/api/namespaces/\<namespace\>/pvcs/\<pvc_name\>/pods](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/volumes/backend/apps/default/routes/get.py#L25) | Gets pods of a `PVC` |
| GET | /api/namespaces/{namespace}/pvcs/{pvc}/events | [/api/namespaces/\<namespace\>/pvcs/\<pvc_name\>/events](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/volumes/backend/apps/default/routes/get.py#L32) | Gets events of a `PVC` |
| GET | /api/namespaces/{namespace}/poddefaults | [/api/namespaces/\<namespace\>/poddefaults](https://github.com/kubeflow/kubeflow/blob/v1.7.0/components/crud-web-apps/jupyter/backend/apps/common/routes/get.py#L29) | Get `PodDefault`s for a given namespace |
