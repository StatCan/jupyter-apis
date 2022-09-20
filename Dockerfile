# Stage 0: UI Build Stage
FROM node:12-alpine as frontend
WORKDIR /src
ENV NG_CLI_ANALYTICS "ci"
RUN apk add --no-cache --virtual .gyp python3 make g++
COPY ./frontend/common/kubeflow-common-lib/package*.json ./
RUN npm ci
COPY ./frontend/common/kubeflow-common-lib/ .
RUN npm run build
COPY ./frontend/jupyter/package*.json ./
COPY ./frontend/jupyter/tsconfig*.json ./
COPY ./frontend/jupyter/angular.json ./
COPY ./frontend/jupyter/src ./src
COPY ./frontend/jupyter/i18n ./src
RUN npm ci

RUN cp -R /src/dist/kubeflow/ ./node_modules/kubeflow/
RUN npm run build -- --output-path=./dist/default --configuration=production
RUN npm run build -- --output-path=./dist/rok --configuration=rok-prod
#Build both locales:
# Possibly need to move to jupyter folder before doing the ngbuild
RUN ./node_modules/.bin/ng build --configuration production --localize

# Stage 1: Build with the golang image
FROM golang:1.17-alpine AS backend
RUN apk add git
WORKDIR /go/src/github.com/StatCan/jupyter-apis
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go install .

# Stage 2: Generate final image
FROM alpine:3.16.2
COPY --from=frontend /src/dist/default /static/
COPY --from=backend /go/bin/jupyter-apis /jupyter-apis
ENV LISTEN_ADDRESS 0.0.0.0:5000
EXPOSE 5000
ENTRYPOINT [ "/jupyter-apis" ]



## Will need to mount the static logo files too