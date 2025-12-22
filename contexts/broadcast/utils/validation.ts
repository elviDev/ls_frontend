import { StudioUser, AudioChannel } from '../types';

export function validateStudioUser(user: any): user is StudioUser {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'username', 'role'];
  for (const field of requiredFields) {
    if (!user[field] || typeof user[field] !== 'string') {
      return false;
    }
  }

  const validRoles = ['host', 'co-host', 'guest', 'moderator', 'producer'];
  if (!validRoles.includes(user.role)) {
    return false;
  }

  if (user.permissions && typeof user.permissions !== 'object') {
    return false;
  }

  return true;
}

export function validateAudioChannel(channel: any): channel is AudioChannel {
  if (!channel || typeof channel !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'name', 'type'];
  for (const field of requiredFields) {
    if (!channel[field] || typeof channel[field] !== 'string') {
      return false;
    }
  }

  const validTypes = ['master', 'guest', 'music', 'jingle', 'ad'];
  if (!validTypes.includes(channel.type)) {
    return false;
  }

  if (typeof channel.volume !== 'number' || channel.volume < 0 || channel.volume > 100) {
    return false;
  }

  if (typeof channel.isMuted !== 'boolean' || typeof channel.isActive !== 'boolean') {
    return false;
  }

  if (channel.eq) {
    const { high, mid, low } = channel.eq;
    if (typeof high !== 'number' || typeof mid !== 'number' || typeof low !== 'number') {
      return false;
    }
    if (high < -12 || high > 12 || mid < -12 || mid > 12 || low < -12 || low > 12) {
      return false;
    }
  }

  return true;
}

export function validateStreamUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function validateWebSocketUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return ['ws:', 'wss:', 'http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function sanitizeVolume(volume: any): number {
  const num = Number(volume);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function sanitizeEQValue(value: any): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(-12, Math.min(12, Math.round(num * 10) / 10));
}

export function validateBroadcastConfig(config: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.studioId && typeof config.studioId !== 'string') {
    errors.push('Studio ID must be a string');
  }

  if (config.signalingUrl && !validateWebSocketUrl(config.signalingUrl)) {
    errors.push('Invalid signaling URL format');
  }

  if (config.streamingUrl && !validateStreamUrl(config.streamingUrl)) {
    errors.push('Invalid streaming URL format');
  }

  if (config.streamKey && typeof config.streamKey !== 'string') {
    errors.push('Stream key must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}