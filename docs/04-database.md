# Database (ERD)

## Core Tables

TravelMate는 다음 핵심 테이블로 구성됩니다.

User
- id
- email
- passwordHash
- nickname
- type (TRAVELER | LOCAL)

Request
- id
- travelerId
- city
- startDate
- endDate
- tags
- status

Match
- id
- requestId
- travelerId
- localId

Chat
- id
- matchId

Message
- id
- chatId
- senderId
- content
- createdAt

ChatMember
- chatId
- userId
- lastReadAt
- lastReadMsgId

## Relationships

User (1) → (N) Request

Request (1) → (N) Match

Match (1) → (1) Chat

Chat (1) → (N) Message

Chat (N) → (N) User
(ChatMember 테이블을 통해 관리)

## Index Strategy

Message
- (chatId, createdAt)

ChatMember
- (userId, updatedAt)

이 인덱스를 통해 다음 쿼리를 최적화합니다.

- 채팅 메시지 pagination
- 채팅 inbox 조회

## ERD Diagram

```mermaid
erDiagram
  USER ||--o{ REQUEST : creates
  REQUEST ||--o{ MATCH : has
  USER ||--o{ MATCH : traveler
  USER ||--o{ MATCH : local
  MATCH ||--|| CHAT : creates
  CHAT ||--o{ MESSAGE : contains
  USER ||--o{ MESSAGE : sends
  CHAT ||--o{ CHATMEMBER : has
  USER ||--o{ CHATMEMBER : joins
```md