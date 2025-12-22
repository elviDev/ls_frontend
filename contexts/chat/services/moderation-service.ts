import { SocketService } from './socket-service';
import { toast } from 'sonner';

export class ModerationService {
  constructor(private socketService: SocketService) {}

  moderateMessage(
    messageId: string,
    action: 'delete' | 'pin' | 'highlight' | 'unpin',
    currentBroadcast?: string
  ): void {
    if (!this.socketService.isConnected() || !currentBroadcast) {
      toast.error('Not connected to chat');
      return;
    }

    this.socketService.emit('chat:moderate', {
      messageId,
      action
    });
  }

  moderateUser(
    userId: string,
    action: 'ban' | 'unban' | 'mute' | 'unmute' | 'timeout',
    currentBroadcast?: string,
    duration?: number
  ): void {
    if (!this.socketService.isConnected() || !currentBroadcast) {
      toast.error('Not connected to chat');
      return;
    }

    this.socketService.emit('moderate-user', {
      userId,
      action,
      broadcastId: currentBroadcast,
      reason: `User ${action}ed by moderator`,
      duration,
    });
  }
}