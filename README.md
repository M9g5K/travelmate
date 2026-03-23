
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

# 🌏 TravelMate

외국인 여행자와 한국 로컬을 연결하는 **여행 매칭 플랫폼**입니다.  
여행자가 여행 요청을 생성하고, 로컬이 이를 보고 도움을 제공하며 매칭이 성사되면 채팅을 통해 소통할 수 있습니다.

이 프로젝트는 **실제 서비스 수준의 MVP 구현**을 목표로 개발되었습니다.

---

# 🚀 서비스 흐름 (Service Flow)

TravelMate는 다음과 같은 흐름으로 작동합니다.

1. Traveler가 여행 요청 생성
2. Local이 요청을 보고 Like
3. Traveler가 Local을 Accept
4. Match 생성
5. Chat 시작
6. 여행 후 Review 작성

---

# 🧩 주요 기능

## 🔐 인증 (Authentication)
- 회원가입
- 로그인
- JWT 기반 인증

---

## 👤 사용자 프로필 (User Profile)

사용자는 자신의 프로필을 관리할 수 있습니다.

기능

- 프로필 조회
- 프로필 수정
- 국가 설정
- 언어 설정
- 자기소개 작성
- 프로필 이미지 업로드

API

- GET /me
- PUT /me/profile
- POST /me/profile-image

---

## ✈️ 여행 요청 (Travel Requests)

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

## ❤️ 매칭 시스템 (Matching System)

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

## 💬 채팅 시스템 (Chat System)

매칭이 완료되면 채팅이 가능합니다.

기능

- 채팅방 목록 조회 (Inbox)
- 메시지 전송
- 메시지 조회 (페이지네이션)
- 읽음 처리 (Read Receipt)
- 특정 메시지 이후 조회 (Sync)

API

- GET /chats/mine
- GET /chats/:chatId
- GET /chats/:chatId/messages
- POST /chats/:chatId/messages
- POST /chats/:chatId/seen

---

## ⭐ 리뷰 시스템 (Review System)

매칭 이후 상대 유저에게 리뷰를 남길 수 있습니다.

기능

- 별점 (1~5)
- 코멘트 작성
- 유저별 리뷰 조회

API

- POST /reviews
- GET /reviews/users/:id

---

## 🚨 신고 시스템 (Report System)

문제가 있는 유저를 신고할 수 있습니다.

API

- POST /reports
- GET /reports/mine

---

## 🚫 차단 시스템 (Block System)

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

# 🏗 기술 스택 (Tech Stack)

### 프론트엔드

- Next.js
- TailwindCSS

### 백엔드

- NestJS
- Prisma

### 데이터베이스

- PostgreSQL

---

# 📊 현재 상태 (Current Status)

- 핵심 기능 완료 (Auth, Requests, Matches, Chats)
- 차단 시스템 및 필터링 구현 완료
- 리뷰 및 신고 시스템 구현 완료
- 프론트엔드 UX 구현 완료
- MVP 배포 가능 상태

---

# 📂 프로젝트 구조 (Project Structure)

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

# ⚙️ 로컬 개발 환경 (Local Development)

## 백엔드

```
cd apps/api
npm install
npx prisma migrate dev
npm run start:dev
```

서버 주소

```
http://localhost:3000
```

## 프론트엔드

```
cd apps/web
npm install
npm run dev
```

웹 주소

```
http://localhost:3001
```

---

# 🧪 테스트 흐름 (Test Flow)

추천 테스트 시나리오

```
1. Traveler 계정 생성
2. 여행 요청 생성
3. Local 계정 로그인
4. 요청에 Like
5. Traveler가 Accept
6. Match 생성
7. 채팅 시작
8. 리뷰 작성
```

---

# 📌 향후 개선 사항 (Future Improvements)

- 실시간 채팅 (WebSocket)
- 관리자 대시보드 (신고 관리)
- 푸시 알림
- 다국어 번역
- 모바일 앱 배포

---

# 👨‍💻 개발자 (Author)

TravelMate 프로젝트

풀스택 개발

프론트엔드
- Next.js
- TailwindCSS

백엔드
- NestJS
- Prisma
- PostgreSQL

---

# 📜 라이선스 (License)

MIT