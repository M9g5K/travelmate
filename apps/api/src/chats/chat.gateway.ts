import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

type AuthedUser = { userId: string; email?: string };

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
  constructor(
    private chats: ChatsService,
    private jwt: JwtService,
  ) {
    console.log('✅ ChatGateway constructor called');
  }

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('✅ ChatGateway afterInit called');
  }

  handleConnection(socket: Socket) {
    console.log('✅ handleConnection called', socket.id);

    try {
      const rawAuth = socket.handshake.auth as any;

      const token =
        rawAuth?.token ||
        this.extractBearer(
          socket.handshake.headers?.authorization as string | undefined,
        );

      if (!token) {
        console.log('❌ socket connection rejected: no token');
        socket.disconnect(true);
        return;
      }

      const payload = this.jwt.verify(token.trim(), {
        secret: process.env.JWT_ACCESS_SECRET!,
      }) as any;

      const user: AuthedUser = {
        userId: payload.sub,
        email: payload.email,
      };

      socket.data.user = user;
      console.log('✅ socket authenticated:', user.userId);
    } catch (error) {
      console.log('❌ socket auth failed');
      socket.disconnect(true);
    }
  }

  private extractBearer(authHeader?: string) {
    if (!authHeader) return null;
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    await this.chats.ensureChatMemberRow(data.chatId, user.userId);

    socket.join(data.chatId);
    console.log('✅ joinChat:', data.chatId, user.userId);

    return { ok: true, joined: data.chatId };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: { chatId: string; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    const msg = await this.chats.sendMessage(
      data.chatId,
      user.userId,
      data.content,
    );

    this.server.to(data.chatId).emit('newMessage', msg);
    console.log('✅ sendMessage:', data.chatId, user.userId, data.content);

    return { ok: true, data: msg };
  }

  @SubscribeMessage('typing:start')
  async typingStart(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    await this.chats.ensureChatMember(data.chatId, user.userId);

    socket.to(data.chatId).emit('typing', {
      chatId: data.chatId,
      userId: user.userId,
      isTyping: true,
    });

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

    socket.to(data.chatId).emit('typing', {
      chatId: data.chatId,
      userId: user.userId,
      isTyping: false,
    });

    return { ok: true };
  }

  @SubscribeMessage('messages:seen')
  async seen(
    @MessageBody() data: { chatId: string; lastReadMsgId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user as AuthedUser | undefined;
    if (!user?.userId) return { ok: false, error: 'UNAUTHORIZED' };

    const member = await this.chats.markSeen(
      data.chatId,
      user.userId,
      data.lastReadMsgId,
    );

    socket.to(data.chatId).emit('readReceipt', {
      chatId: data.chatId,
      userId: user.userId,
      lastReadAt: member.lastReadAt,
      lastReadMsgId: member.lastReadMsgId ?? null,
    });

    return { ok: true };
  }
}