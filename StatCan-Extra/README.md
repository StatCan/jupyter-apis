[(Français)](#interface-de-programmation-dapplications-jupyter)

## Jupyter Application Programming Interfaces

A Golang replacement for the [Kubeflow](https://github.com/kubeflow/kubeflow) Jupyter Web APIs.

### How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md)

### License

Unless otherwise noted, the source code of this project is covered under Crown Copyright, Government of Canada, and is distributed under the [MIT License](LICENSE).

The Canada wordmark and related graphics associated with this distribution are protected under trademark law and copyright law. No permission is granted to use them outside the parameters of the Government of Canada's corporate identity program. For more information, see [Federal identity requirements](https://www.canada.ca/en/treasury-board-secretariat/topics/government-communications/federal-identity-requirements.html).

## Developement
_Set up CLI tools to interact with Kubernetes (connect to remote AKS cluster):_
1. Install Azure CLI `az` and `kubectl`
2. Login with `az` and set your subscription
3. Run `az aks get-credentials` for the desired remote cluster
4. Clone this repository

_Frontend:_
1. Install `Go`
2. From `jupyter-apis/`, run `. -spawner-config samples/spawner_ui_config.yaml`
3. From `jupyter-apis/frontend`, run `npm install`
    - This will install all of the project dependencies and prepare your system for development.
4. To start a development environment, run `npm start`
    - This runs [webpack](https://webpack.js.org/) over the front-end code and starts
      the dev-server at http://localhost:4200/jupyter/.
5. Open browser to `http://localhost:4200/jupyter/`, update Namespace.

### Connect this jupyter-apis component to local instance of Kubeflow:
_Set up local Kubeflow cluster using [MiniKF](https://www.kubeflow.org/docs/started/workstation/getting-started-minikf/):_

Note: Need at least 50GB of disk space
1. Install Vagrant and Virtual Box
2. Create a new directory and run `vagrant init arrikto/minikf` and then `vagrant up` (takes about 20 minutes to boot)
3. Navigate to http://10.10.10.10
4. Follow on-screen steps to start Kubeflow and Rok (takes about another 20 minutes) 
5. From here, you can use Kubeflow and Rok

_Configure a `kubectl` context for that cluster:_
1. Have `kubectl` CLI set up and `Go` installed
2. From http://10.10.10.10, download the MiniKF kubeconfig file
   - Can either move this file into your `.kube/` directory and rename it to `config` or can change the default config file name and path in [`main.go`](https://github.com/StatCan/jupyter-apis/blob/master/main.go#L69) to the path and name of the `minikf-kubeconfig` downloaded file
3. From `jupyter-apis/`, run `. -spawner-config samples/spawner_ui_config.yaml`
   - Can update the [YAML file](https://github.com/StatCan/jupyter-apis/blob/master/samples/spawner_ui_config.yaml#L17) if you want to put your custom images into the notebook server image dropdown list.
4. From `jupyter-apis/frontend` folder, run `npm install` and `KF_USER_ID=<username given by MiniKF> npm start`
   - Usually, the `KF_USER_ID` will be `user` because that may be the default username MiniKF always gives
5. Navigate to http://localhost:4200/jupyter/
6. Set Namespace to `kubeflow-user`

**To connect to MiniKF, have to go into directory created and run `vagrant up` every time, then navigate to http://10.10.10.10**

______________________

## Interface de programmation d'applications Jupyter

Un remplacement Golang pour les API de Web de Jupyter, partie de [Kubeflow](https://github.com/kubeflow/kubeflow).

### Comment contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md)

### Licence

Sauf indication contraire, le code source de ce projet est protégé par le droit d'auteur de la Couronne du gouvernement du Canada et distribué sous la [licence MIT](LICENSE).

Le mot-symbole « Canada » et les éléments graphiques connexes liés à cette distribution sont protégés en vertu des lois portant sur les marques de commerce et le droit d'auteur. Aucune autorisation n'est accordée pour leur utilisation à l'extérieur des paramètres du programme de coordination de l'image de marque du gouvernement du Canada. Pour obtenir davantage de renseignements à ce sujet, veuillez consulter les [Exigences pour l'image de marque](https://www.canada.ca/fr/secretariat-conseil-tresor/sujets/communications-gouvernementales/exigences-image-marque.html).
