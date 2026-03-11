import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class TestGateway implements OnGatewayInit {
  afterInit(server: Server) {
    console.log('✅ TestGateway afterInit called');
  }
}