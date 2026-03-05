# Dev Notes

## 1) Socket.IO 404 이슈
- 증상: /socket.io 접속 시 404
- 원인: Gateway 설정/서버 구동 상태에서 Socket.IO 엔드포인트 미노출
- 해결: ChatGateway 등록 확인 후 /socket.io polling 200 OK 확인

## 2) JWT 기반 Socket 인증
- 목표: senderId를 클라이언트에서 받지 않고, server-side 인증 userId를 사용
- 방식: socket.handshake.auth.token 또는 Authorization Bearer에서 token 추출 → jwt.verify → socket.data.user 저장

## 3) Read Receipt 설계
- ChatMember 테이블로 (chatId, userId) 단위 상태 관리
- lastReadAt / lastReadMsgId 저장
- events:
  - messages:seen -> readReceipt broadcast

## 4) Missed Sync
- 네트워크 단절/재접속 대비
- REST: GET /chats/:chatId/messages/after?after=<messageId>

## 5) SQLite -> PostgreSQL 전환
- 이유: 실서비스/포트폴리오 기준으로 Postgres가 표준에 가까움
- 이슈: 5432 포트 충돌 → 5434로 변경
- 마이그레이션 재적용 후 seed로 dev 데이터 구성

## 6) Seed 스키마 mismatch
- 증상: enum 이름(UserType), RequestStatus 값(OPEN) 불일치
- 해결: 실제 schema 기준으로 seed 수정(type/status 문자열 사용, 목적 필드 제거)
