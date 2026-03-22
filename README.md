
# 🌏 TravelMate

외국인 여행자와 한국 로컬을 연결하는 **여행 매칭 플랫폼**입니다.  
여행자가 여행 요청을 만들고, 로컬이 도움을 제공하며 매칭이 성사되면 채팅을 통해 소통할 수 있습니다.

이 프로젝트는 **실제 서비스 수준 MVP 구현**을 목표로 개발되었습니다.

---

# 🚀 Service Flow

TravelMate는 다음과 같은 흐름으로 작동합니다.

1. Traveler가 여행 요청 생성
2. Local이 요청을 보고 Like
3. Traveler가 Local Accept
4. Match 생성
5. Chat 시작
6. 여행 후 Review 작성

---

# 🧩 주요 기능

## 🔐 Authentication
- 회원가입
- 로그인
- JWT 인증

---

## 👤 User Profile

사용자는 자신의 프로필을 관리할 수 있습니다.

기능

- 프로필 조회
- 프로필 수정
- 국가 설정
- 언어 설정
- 자기소개
- 프로필 이미지 업로드

 API

- GET /me
- PUT /me/profile
- POST /me/profile-image

---

## ✈️ Travel Requests

여행자가 여행 요청을 생성할 수 있습니다.

요청 정보

- 도시
- 여행 날짜
- 여행 목적
- 여행 설명

기능

- 요청 생성
- 요청 목록 조회
- 내가 만든 요청 조회

API
- POST /requests
- GET /requests
- GET /requests/mine

---

## ❤️ Matching System

매칭 과정
```
Traveler Request
      ↓
Local Like
      ↓
Traveler Accept
      ↓
Match 생성
```

API
- POST /requests/:id/like
- GET /requests/:id/likes
- POST /requests/:id/accept

---

## 💬 Chat System

매칭이 되면 채팅이 가능합니다.

기능

- 채팅방 목록 조회 (Inbox)
- 메시지 전송
- 메시지 조회 (Pagination)
- 읽음 처리 (Read Receipt)
- 특정 메시지 이후 조회 (Sync)

API
- GET /chats/mine
- GET /chats/:chatId
- GET /chats/:chatId/messages
- POST /chats/:chatId/messages
- POST /chats/:chatId/seen

---

## ⭐ Review System

매칭 후 상대 유저에게 리뷰를 남길 수 있습니다.

기능

- 별점 (1~5)
- 코멘트 작성
- 유저별 리뷰 조회

API
- POST /reviews
- GET /reviews/users/:id

---

## 🚨 Report System

문제가 있는 유저를 신고할 수 있습니다.

API
- POST /reports
- GET /reports/mine

---

## 🚫 Block System

기능

- 유저 차단 / 차단 해제
- 차단된 유저 자동 필터링

차단 시 동작

- 요청 목록에서 해당 유저 숨김
- 채팅 접근 차단
- 메시지 전송 제한
- 좋아요 및 매칭 제한

API
- POST /blocks
- GET /blocks
- DELETE /blocks/:blockedUserId

---

# 🏗 Tech Stack

### Frontend

- Next.js
- TailwindCSS

### Backend

- NestJS
- Prisma

### Database

- PostgreSQL

---

# 📊 Current Status

- Core features completed (Auth, Requests, Matches, Chats)
- Block system with filtering implemented
- Review & Report system implemented
- Frontend UX completed
- MVP ready for deployment

---

# 📂 Project Structure

```
apps
 ├ api
 │   ├ auth
 │   ├ users
 │   ├ requests
 │   ├ matches
 │   ├ chats
 │   ├ reviews
 │   ├ reports
 │   ├ blocks
 │   └ prisma
 │
 └ web
     ├ app
     │   ├ requests
     │   ├ matches
     │   ├ chats
     │   ├ reports
     │   ├ blocks
     │   └ me
     │
     └ components
```

---

# ⚙️ Local Development

## Backend

```
cd apps/api
npm install
npx prisma migrate dev
npm run start:dev
```

Server

```
http://localhost:3000
```

## Frontend

```
cd apps/web
npm install
npm run dev
```

Web

```
http://localhost:3001
```

---

# 🧪 Test Flow

Recommended testing flow

```
1. Create Traveler account
2. Create travel request
3. Login with Local account
4. Like request
5. Traveler accepts
6. Match created
7. Start chat
8. Write review
```

---

# 📌 Future Improvements

- Real-time chat (WebSocket)
- Admin dashboard (report management)
- Push notifications
- Multi-language translation
- Mobile app deployment

---

# 👨‍💻 Author

TravelMate Project

Full‑stack development

Frontend
- Next.js
- TailwindCSS

Backend
- NestJS
- Prisma
- PostgreSQL

---

# 📜 License

MIT