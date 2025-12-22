export class BroadcastError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public context?: any
  ) {
    super(message);
    this.name = 'BroadcastError';
  }
}

export const ErrorCodes = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_LOST: 'CONNECTION_LOST',
  AUDIO_DEVICE_ERROR: 'AUDIO_DEVICE_ERROR',
  AUDIO_PERMISSION_DENIED: 'AUDIO_PERMISSION_DENIED',
  AUDIO_FORMAT_UNSUPPORTED: 'AUDIO_FORMAT_UNSUPPORTED',
  WEBRTC_OFFER_FAILED: 'WEBRTC_OFFER_FAILED',
  WEBRTC_ANSWER_FAILED: 'WEBRTC_ANSWER_FAILED',
  WEBRTC_ICE_FAILED: 'WEBRTC_ICE_FAILED',
  STREAM_START_FAILED: 'STREAM_START_FAILED',
  STREAM_ENCODING_ERROR: 'STREAM_ENCODING_ERROR',
  STREAM_NETWORK_ERROR: 'STREAM_NETWORK_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAM',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export function createBroadcastError(
  code: keyof typeof ErrorCodes,
  message: string,
  recoverable: boolean = true,
  context?: any
): BroadcastError {
  return new BroadcastError(message, ErrorCodes[code], recoverable, context);
}

export function handleBroadcastError(
  error: Error | BroadcastError,
  onError?: (error: BroadcastError) => void
): BroadcastError {
  let broadcastError: BroadcastError;
  
  if (error instanceof BroadcastError) {
    broadcastError = error;
  } else {
    broadcastError = new BroadcastError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      true,
      { originalError: error }
    );
  }
  
  console.error(`[BroadcastError] ${broadcastError.code}: ${broadcastError.message}`, {
    recoverable: broadcastError.recoverable,
    context: broadcastError.context,
    stack: broadcastError.stack
  });
  
  onError?.(broadcastError);
  return broadcastError;
}

export function isRecoverableError(error: Error | BroadcastError): boolean {
  if (error instanceof BroadcastError) {
    return error.recoverable;
  }
  
  const recoverablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /temporary/i
  ];
  
  return recoverablePatterns.some(pattern => 
    pattern.test(error.message) || pattern.test(error.name)
  );
}