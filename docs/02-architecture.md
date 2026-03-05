# Architecture

## System Architecture

TravelMate는 다음 구조로 구성됩니다.

Client
- Web (Next.js 예정)

Backend
- NestJS REST API
- Socket.IO Realtime Server

Database
- PostgreSQL
- Prisma ORM

## Backend Modules

NestJS 기반 모듈 구조

- AuthModule
- UsersModule
- RequestsModule
- MatchesModule
- ChatsModule
- HealthModule

## Chat Architecture

채팅 시스템은 두 가지 방식으로 동작합니다.

### REST API

메시지 조회 및 상태 관리

- GET /chats/:chatId/messages
- GET /chats/:chatId/messages/after
- POST /chats/:chatId/messages
- POST /chats/:chatId/seen

### Realtime (Socket.IO)

- joinChat
- sendMessage
- typing:start
- typing:stop
- messages:seen

JWT 기반 인증을 사용하여 Socket 연결 시 사용자 인증을 수행합니다.

## Database Layer

Prisma ORM을 사용하여 PostgreSQL과 연결됩니다.

주요 테이블

- User
- Request
- Match
- Chat
- Message
- ChatMember
