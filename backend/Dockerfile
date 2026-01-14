FROM golang:1.25-alpine AS builder

LABEL authors="liun"

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG VERSION=dev
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags "-X main.version=${VERSION}" -o /app/main ./cmd/server


FROM scratch

WORKDIR /app

COPY --from=builder /app/main .
COPY static ./static

COPY criteria.json .

EXPOSE 8080

CMD ["/app/main"]
