# API Summary

> Base URL: http://localhost:3000  
> Swagger: http://localhost:3000/docs

## Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- GET /me

## Requests
- POST /requests  
  여행 요청 생성
- GET /requests  
  여행 요청 목록 조회
- GET /requests/mine  
  내 요청 목록 조회
- POST /requests/:id/like  
  로컬이 요청 Like
- GET /requests/:id/likes  
  요청에 달린 Like 목록
- POST /requests/:id/accept  
  여행자가 로컬 Like를 Accept → Match 생성

## Matches
- GET /matches/mine  
  내 매칭 목록
- GET /matches/:id  
  매칭 상세

## Chats (REST)
- GET /chats/mine  
  인박스(내 채팅방 목록: 상대/요청/마지막 메시지/unreadCount)
- GET /chats/:chatId  
  채팅방 헤더(요청 요약 + 상대 + read 상태)
- GET /chats/:chatId/messages  
  메시지 조회(cursor pagination)
- GET /chats/:chatId/messages/after  
  missed sync(after messageId)
- POST /chats/:chatId/messages  
  메시지 전송(REST)
- POST /chats/:chatId/seen  
  read receipt 저장(REST)

## Realtime (Socket.IO)
- joinChat { chatId }
- sendMessage { chatId, content } -> newMessage broadcast
- typing:start { chatId } / typing:stop { chatId } -> typing broadcast
- messages:seen { chatId, lastReadMsgId? } -> readReceipt broadcast

## Response Convention
- success: { ok: true, data: ... }
- error: NestJS 표준 에러 응답(추후 ok:false 형태로 통일 가능)
