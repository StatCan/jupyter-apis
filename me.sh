cd frontend/common/kubeflow-common-lib
npm i
npm run build
cd dist/kubeflow
npm link

cd ../../../../jupyter
npm i
npm link kubeflow --legacy-peer-deps
KF_USER_ID=wendy.gaultier@statcan.gc.ca npm start
#KF_USER_ID=wendy.gaultier2@cloud.statcan.ca npm start #wendy.gaultier2@cloud.statcan.ca