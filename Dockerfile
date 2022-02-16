# Stage 0: UI Build Stage
FROM node:12-buster-slim as frontend
WORKDIR /src
COPY ./jupyter/frontend/package*.json ./
COPY ./jupyter/frontend/tsconfig*.json ./
COPY ./jupyter/frontend/angular.json ./
COPY ./jupyter/frontend/src ./src
ENV NG_CLI_ANALYTICS "ci"
RUN npm ci
COPY --from=frontend-kubeflow-lib /src/dist/kubeflow/ ./node_modules/kubeflow/
RUN npm run build -- --output-path=./dist/default --configuration=production
RUN npm run build -- --output-path=./dist/rok --configuration=rok-prod

# Stage 1: Build with the golang image
FROM golang:1.17-alpine AS backend
RUN apk add git
WORKDIR /go/src/github.com/StatCan/jupyter-apis
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go install .

# Generate final image
FROM scratch
COPY --from=frontend /app/dist/out/default /static/
COPY --from=backend /go/bin/jupyter-apis /jupyter-apis
ENV LISTEN_ADDRESS 0.0.0.0:5000
EXPOSE 5000
ENTRYPOINT [ "/jupyter-apis" ]
