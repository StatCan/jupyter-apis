# Frontend differences from Upstream

Listed here will mainly be alterations/removals of features from Upstream. 
Any new features that we've implemented won't necessarily be added here as those have less impact during the Kubeflow version updates.

## [Kubeflow Common library](./frontend/common/kubeflow-common-lib/)

*List differences in the common library package here*

## [Jupyter](./frontend/jupyter/)

### [New Notebook Form](./frontend/jupyter/src/app/pages/form/form-new/)

- Removed the language input from the "form-advanced-options" section (a.k.a the "Miscellaneous Settings" section). This was done in [this pull request](https://github.com/StatCan/jupyter-apis/pull/374), but the "shared memory" input was re-added in [this pull request](https://github.com/StatCan/jupyter-apis/pull/386).