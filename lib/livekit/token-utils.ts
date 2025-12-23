import { AccessToken } from 'livekit-server-sdk';

export interface TokenOptions {
  identity: string;
  name?: string;
  metadata?: string;
  roomName: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  canUpdateOwnMetadata?: boolean;
}

export async function generateLiveKitToken(options: TokenOptions): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit API key and secret must be configured');
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: options.identity,
    name: options.name,
    metadata: options.metadata,
  });

  at.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: options.canPublish ?? true,
    canSubscribe: options.canSubscribe ?? true,
    canPublishData: options.canPublishData ?? true,
    canUpdateOwnMetadata: options.canUpdateOwnMetadata ?? true,
  });

  return await at.toJwt();
}

export async function generateBroadcasterToken(userId: string, roomName: string, userName?: string): Promise<string> {
  return await generateLiveKitToken({
    identity: userId,
    name: userName || userId,
    roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
}

export async function generateListenerToken(userId: string, roomName: string, userName?: string): Promise<string> {
  return await generateLiveKitToken({
    identity: userId,
    name: userName || userId,
    roomName,
    canPublish: false,
    canSubscribe: true,
    canPublishData: false,
  });
}