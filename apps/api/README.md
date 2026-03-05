# TravelMate (Portfolio, Monorepo)

외국인 여행자(TRAVELER)와 한국인 로컬(LOCAL)을 매칭해
여행 정보 공유 및 동행(온라인/오프라인)을 연결하는 서비스 MVP.

## Repo Structure
- apps/api: NestJS + Prisma + PostgreSQL + Socket.IO (Backend)
- apps/web: Next.js (예정)

## Key Features
### Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- GET /me

### Requests
- POST /requests
- GET /requests
- GET /requests/mine
- POST /requests/:id/like
- GET /requests/:id/likes
- POST /requests/:id/accept

### Matches
- GET /matches/mine
- GET /matches/:id

### Chats (REST + Realtime)
REST
- POST /chats/:chatId/messages
- GET /chats/:chatId/messages (cursor pagination)
- GET /chats/:chatId/messages/after (missed sync)
- POST /chats/:chatId/seen (read receipt)
- GET /chats/mine (inbox)
- GET /chats/:chatId (chat detail)

Realtime (Socket.IO + JWT)
- joinChat
- sendMessage -> newMessage
- typing:start / typing:stop -> typing
- messages:seen -> readReceipt

## Tech Stack
Backend
- NestJS
- Prisma
- PostgreSQL
- Socket.IO

Infra (dev)
- Docker Compose

## Local Setup
### 1) PostgreSQL
```bash
docker compose up -d