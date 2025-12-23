# LiveKit Migration Guide

## Overview
This guide helps you migrate from the SRS-based broadcasting system to LiveKit for better real-time audio streaming.

## Environment Setup

Add these environment variables to your `.env.local`:

```bash
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_SERVER_URL=wss://your-livekit-server.com
```

## Basic Usage

### 1. Replace BroadcastProvider with LiveKitBroadcastProvider

**Before (SRS):**
```tsx
import { BroadcastProvider } from '@/contexts/broadcast';

function App() {
  return (
    <BroadcastProvider>
      {/* Your app */}
    </BroadcastProvider>
  );
}
```

**After (LiveKit):**
```tsx
import { LiveKitBroadcastProvider } from '@/contexts/broadcast';

function App() {
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    // Fetch token from your API
    fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-123',
        roomName: 'radio-broadcast',
        userName: 'DJ Name',
        role: 'broadcaster'
      })
    })
    .then(res => res.json())
    .then(data => setToken(data.token));
  }, []);

  if (!token) return <div>Loading...</div>;

  return (
    <LiveKitBroadcastProvider 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL!}
      token={token}
    >
      {/* Your app */}
    </LiveKitBroadcastProvider>
  );
}
```

### 2. Update Hook Usage

**Before:**
```tsx
import { useBroadcast } from '@/contexts/broadcast';

function BroadcastControls() {
  const { studio } = useBroadcast();
  // ... rest of component
}
```

**After:**
```tsx
import { useLiveKitBroadcast } from '@/contexts/broadcast';

function BroadcastControls() {
  const { studio } = useLiveKitBroadcast();
  // API remains the same!
}
```

### 3. Use LiveKit Components

```tsx
import { LiveKitBroadcaster, LiveKitListener, LiveKitAudioMixer } from '@/components/livekit/audio-components';

function StudioPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <LiveKitBroadcaster />
      <LiveKitAudioMixer />
    </div>
  );
}

function ListenerPage() {
  return <LiveKitListener />;
}
```

## Key Benefits

1. **No Custom Signaling**: LiveKit handles all WebRTC signaling automatically
2. **Better Audio Quality**: Advanced audio processing and adaptive bitrate
3. **Scalability**: Built-in load balancing and global edge network
4. **Reliability**: Automatic reconnection and error recovery
5. **Recording**: Built-in recording capabilities
6. **Analytics**: Real-time metrics and monitoring

## Migration Steps

1. ✅ Install LiveKit dependencies
2. ✅ Create LiveKit provider and components
3. ✅ Add token generation API
4. 🔄 Update your app to use LiveKit provider
5. 🔄 Test broadcasting and listening functionality
6. 🔄 Remove old SRS implementation files

## Next Steps

1. Set up LiveKit server (self-hosted or use LiveKit Cloud)
2. Configure environment variables
3. Update your app components to use the new provider
4. Test the integration
5. Remove the old broadcast context files when ready

## LiveKit Server Options

### Option 1: LiveKit Cloud (Recommended)
- Sign up at https://cloud.livekit.io
- Get API keys from dashboard
- Use their global infrastructure

### Option 2: Self-hosted
- Deploy LiveKit server using Docker
- Configure your own infrastructure
- More control but requires maintenance