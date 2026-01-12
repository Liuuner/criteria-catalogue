FROM golang:1.25-alpine AS builder

LABEL authors="liun"

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# This CGO important to run in a minimal image like scratch
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./cmd/server


FROM scratch

WORKDIR /app

COPY --from=builder /app/main .

COPY criteria.json .

EXPOSE 8080

CMD ["/app/main"]