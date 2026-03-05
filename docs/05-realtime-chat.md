# Realtime Chat

TravelMate는 Socket.IO 기반 실시간 채팅 시스템을 사용합니다.

## Authentication

Socket 연결 시 JWT 토큰을 사용하여 사용자 인증을 수행합니다.

Client → Server

socket.connect({
  auth: {
    token: ACCESS_TOKEN
  }
})

Server는 JWT를 검증하여 userId를 식별합니다.

## Chat Events

### joinChat

사용자가 특정 채팅방에 참여할 때 사용됩니다.

client.emit("joinChat", { chatId })

Server는 사용자가 해당 채팅방의 멤버인지 검증한 후
socket을 room에 join시킵니다.

### sendMessage

메시지 전송 이벤트입니다.

client.emit("sendMessage", {
  chatId,
  content
})

Server는

1. 메시지 DB 저장
2. room에 newMessage broadcast

### typing indicator

사용자가 메시지를 입력 중일 때 상태를 전파합니다.

typing:start
typing:stop

### read receipt

메시지 읽음 처리 이벤트

messages:seen

Server는 ChatMember.lastReadAt / lastReadMsgId를 업데이트합니다.

## Message Sync

REST API를 통해 missed message를 동기화합니다.

GET /chats/:chatId/messages/after

이를 통해 다음 상황을 처리합니다.

- reconnect
- network delay
- offline recovery
