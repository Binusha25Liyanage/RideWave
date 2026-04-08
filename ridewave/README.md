# RideWave

RideWave is a full-stack ride-hailing platform built with a microservices architecture.
It includes rider and driver mobile apps, an admin web dashboard, real-time location tracking, ride lifecycle orchestration, surge pricing, payments, notifications, and containerized deployment.

## Tech Stack

- Backend: Node.js, Express
- Mobile: React Native (Expo)
- Web: React + Vite
- Mapping: OpenStreetMap, Leaflet, react-native-maps
- Routing: OpenRouteService
- Geocoding: Nominatim
- Datastores: PostgreSQL, MongoDB, Redis
- Messaging: Kafka
- Infra: Docker Compose, Kubernetes, Nginx

## Monorepo Structure

```text
ridewave/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── ride-service/
│   ├── location-service/
│   ├── pricing-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── review-service/
├── mobile/
│   ├── rider-app/
│   └── driver-app/
├── web/
│   └── admin-dashboard/
├── infra/
│   ├── docker-compose.yml
│   ├── k8s/
│   └── nginx/
├── shared/
│   ├── types/
│   └── utils/
└── tests/
```

## Services

| Service | Port | DB | Responsibility |
|---|---:|---|---|
| api-gateway | 3000 | - | auth middleware, routing, rate limiting |
| auth-service | 3001 | PostgreSQL | register/login/JWT/refresh/OAuth |
| user-service | 3002 | PostgreSQL | rider/driver profiles, nearby driver query |
| ride-service | 3003 | MongoDB | full ride lifecycle + Kafka ride events |
| location-service | 3004 | Redis | WebSocket location updates + geo queries |
| pricing-service | 3005 | Redis | fare estimates + surge multiplier |
| payment-service | 3006 | PostgreSQL | Stripe charges, wallet, refunds, receipts |
| notification-service | 3007 | Firebase | Kafka-driven push/SMS/email notifications |
| review-service | 3008 | PostgreSQL | ratings and feedback |

## Core Features

- Real-time driver tracking with Socket.io and Redis geo indexes
- Nearby-driver lookup via Redis geo queries
- Dynamic surge pricing by demand/supply ratio
- Full ride state machine: request -> accept -> start -> complete/cancel
- Stripe-based payments, wallet top-ups, refunds, PDF receipts
- Kafka event-driven communication between services
- Rider and driver mobile app flows
- Admin dashboard with KPI cards, charts, and live map

## Environment Configuration

Each service includes `.env.example`. Copy to `.env` and fill real credentials:

```bash
cp services/<service-name>/.env.example services/<service-name>/.env
```

Common variables used across services:

- `JWT_SECRET`
- `DATABASE_URL`
- `MONGO_URI`
- `REDIS_URL`
- `KAFKA_BROKER`
- `STRIPE_SECRET_KEY`
- `ORS_API_KEY`
- `FIREBASE_ADMIN_SDK`
- `AWS_S3_BUCKET`

## Local Development

### 1. Install dependencies

```bash
make install
```

### 2. Start full stack (recommended)

```bash
make dev
```

This starts:

- PostgreSQL 15
- MongoDB 7
- Redis 7 + RedisInsight
- Zookeeper + Kafka
- All backend services

### 3. Run database migrations

```bash
make db:migrate
```

### 4. Seed sample data

```bash
make db:seed
```

### 5. Run tests

```bash
make test
```

### 6. Build apps

```bash
make build
```

## Key Endpoints

- Gateway health: `GET /health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Ride lifecycle: `POST /api/rides/request`, `/api/rides/:id/accept`, `/api/rides/:id/start`, `/api/rides/:id/complete`, `/api/rides/:id/cancel`
- Location WS: `ws://localhost:3004`
- Pricing estimate: `GET /api/pricing/estimate`
- Payments: `POST /api/payments/charge`, `POST /api/payments/refund/:rideId`
- Reviews: `POST /api/reviews`

## Event Topics

- `ride.requested`
- `ride.accepted`
- `ride.completed`
- `location.update`

Topic bootstrap script:

```bash
bash infra/kafka-topics.sh
```

## Ports

- `http://localhost:3000` API Gateway
- `http://localhost:5173` Admin dashboard
- `http://localhost:8001` RedisInsight
- `ws://localhost:3004` Location service WebSocket

## Kubernetes Deployment

Apply all manifests:

```bash
make k8s:deploy
```

Manifest file:

- `infra/k8s/ridewave.yaml`

## Project Status

This repository is scaffolded with production-oriented building blocks.
Before production launch, complete these hardening tasks:

- Add strict auth checks on all protected endpoints
- Add API-level integration tests for all services
- Add robust retry/backoff and idempotency on event consumers
- Move secrets to real secret manager (do not keep plaintext secrets)
- Add observability (metrics, tracing, centralized logging)

## Contributing

1. Create a feature branch
2. Commit changes with clear messages
3. Open a pull request

## License

Private/internal by default unless you add an OSS license file.
