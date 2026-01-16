FROM node:22-alpine AS frontendbuilder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


FROM golang:1.25-alpine AS gobuilder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/cmd ./cmd
COPY backend/internal ./internal

COPY --from=frontendbuilder /app/dist ./static

ARG VERSION=dev
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags "-X main.version=${VERSION}" -o /app/main ./cmd/server


FROM scratch

WORKDIR /app

COPY --from=gobuilder /app/main .
COPY --from=gobuilder /app/static ./static
COPY backend/criteria.json .

EXPOSE 8080

CMD ["/app/main"]
