import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

type AuthedUser = { userId: string; email?: string };

@WebSocketGateway({
  namespace: '/',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private chats: ChatsService, private jwt: JwtService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    try {
      const rawAuth = socket.handshake.auth as any;

      const token =
        rawAuth?.token ||
        this.extractBearer(socket.handshake.headers?.authorization as string | undefined);

      if (!token) {
        socket.disconnect(true);
        return;
      }

      const payload = this.jwt.verify(token.trim(), {
        secret: process.env.JWT_ACCESS_SECRET!,
      }) as any;

      const user: AuthedUser = { userId: payload.sub, email: payload.email };
      socket.data.user = user;
    } catch {
      socket.disconnect(true);
    }
  }

  private extractBearer(authHeader?: string) {
    if (!authHeader) return null;
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
  }

  // ✅ joinChat (reconnect 시에도 다시 호출하면 됨)
  @SubscribeMessage('joinChat')
  async joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    // 권한 검증 + ChatMember row 보장
    await this.chats.ensureChatMemberRow(data.chatId, user.userId);

    socket.join(data.chatId);
    return { ok: true, joined: data.chatId };
  }

  // ✅ 메시지 전송 (senderId는 클라가 보내지 않음)
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: { chatId: string; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    const msg = await this.chats.sendMessage(data.chatId, user.userId, data.content);

    this.server.to(data.chatId).emit('newMessage', msg);
    return { ok: true, data: msg };
  }

  // ✅ typing indicator
  @SubscribeMessage('typing:start')
  async typingStart(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    await this.chats.ensureChatMember(data.chatId, user.userId);
    socket.to(data.chatId).emit('typing', { chatId: data.chatId, userId: user.userId, isTyping: true });

    return { ok: true };
  }

  @SubscribeMessage('typing:stop')
  async typingStop(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    await this.chats.ensureChatMember(data.chatId, user.userId);
    socket.to(data.chatId).emit('typing', { chatId: data.chatId, userId: user.userId, isTyping: false });

    return { ok: true };
  }

  // ✅ read receipt: messages:seen
  @SubscribeMessage('messages:seen')
  async seen(
    @MessageBody() data: { chatId: string; lastReadMsgId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    const member = await this.chats.markSeen(data.chatId, user.userId, data.lastReadMsgId);

    socket.to(data.chatId).emit('readReceipt', {
      chatId: data.chatId,
      userId: user.userId,
      lastReadAt: member.lastReadAt,
      lastReadMsgId: member.lastReadMsgId ?? null,
    });

    return { ok: true };
  }
}