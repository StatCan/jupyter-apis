# Stage 0: UI Build Stage
FROM node:10 as frontend

WORKDIR /app

COPY ./frontend/package*.json /app/
RUN npm install

COPY ./frontend/ /app/

# Build the default frontends
RUN npm run build frontend -- --output-path=./dist/out/default --configuration=production

# Stage 1: Build with the golang image
FROM golang:1.14-alpine AS backend

# Add git
RUN apk add git

# Set workdir
WORKDIR /go/src/github.com/StatCan/jupyter-apis

# Add dependencies
COPY go.mod .
COPY go.sum .
RUN go mod download

# Build
COPY . .
RUN CGO_ENABLED=0 go install .

# Generate final image
FROM scratch
COPY --from=frontend /app/dist/out/default /static/
COPY --from=backend /go/bin/jupyter-apis /jupyter-apis
ENTRYPOINT [ "/jupyter-apis" ]
