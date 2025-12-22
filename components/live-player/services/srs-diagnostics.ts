export class SRSDiagnostics {
  private srsUrl: string;

  constructor(srsUrl: string) {
    this.srsUrl = srsUrl;
  }

  async checkServerStatus(): Promise<{
    isRunning: boolean;
    version?: string;
    error?: string;
  }> {
    try {
      console.log('🔍 [SRS] Checking server status at:', this.srsUrl);
      const response = await fetch(`${this.srsUrl}/api/v1/summaries`);
      
      if (!response.ok) {
        return {
          isRunning: false,
          error: `Server returned ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('🔍 [SRS] Server response:', data);
      
      return {
        isRunning: true,
        version: data.data?.version || 'unknown'
      };
    } catch (error) {
      console.error('🔍 [SRS] Server check failed:', error);
      return {
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkStreamExists(streamKey: string, maxRetries: number = 10, retryDelay: number = 1000): Promise<{
    exists: boolean;
    isLive: boolean;
    hlsUrl?: string;
    error?: string;
  }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [SRS] Checking stream (attempt ${attempt}/${maxRetries}):`, streamKey);
        
        // Check if stream exists in SRS
        const streamsResponse = await fetch(`${this.srsUrl}/api/v1/streams/`);
        if (!streamsResponse.ok) {
          return {
            exists: false,
            isLive: false,
            error: `Failed to fetch streams: ${streamsResponse.status}`
          };
        }

        const streamsData = await streamsResponse.json();
        console.log(`🔍 [SRS] Available streams (attempt ${attempt}):`, streamsData);
        
        const streams = streamsData.streams || [];
        const targetStream = streams.find((s: any) => s.name === streamKey || s.stream === streamKey);
        
        if (targetStream) {
          // Stream found, check HLS availability
          const hlsUrl = `${this.srsUrl}/live/${streamKey}.m3u8`;
          const hlsResponse = await fetch(hlsUrl);
          
          console.log(`🔍 [SRS] HLS check response (attempt ${attempt}):`, hlsResponse.status, hlsResponse.statusText);
          
          return {
            exists: true,
            isLive: hlsResponse.ok,
            hlsUrl: hlsResponse.ok ? hlsUrl : undefined,
            error: !hlsResponse.ok ? `HLS not available: ${hlsResponse.status}` : undefined
          };
        }
        
        // Stream not found, wait and retry if not last attempt
        if (attempt < maxRetries) {
          console.log(`🔍 [SRS] Stream not found, waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
      } catch (error) {
        console.error(`🔍 [SRS] Stream check failed (attempt ${attempt}):`, error);
        if (attempt === maxRetries) {
          return {
            exists: false,
            isLive: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
    
    return {
      exists: false,
      isLive: false,
      error: `Stream ${streamKey} not found after ${maxRetries} attempts`
    };
  }

  async testWhipEndpoint(streamKey: string): Promise<{
    available: boolean;
    error?: string;
  }> {
    try {
      console.log('🔍 [SRS] Testing WHIP endpoint for:', streamKey);
      const whipUrl = `${this.srsUrl}/rtc/v1/whip/?app=live&stream=${streamKey}`;
      
      // Test with OPTIONS request first
      const response = await fetch(whipUrl, { method: 'OPTIONS' });
      console.log('🔍 [SRS] WHIP OPTIONS response:', response.status, response.headers);
      
      return {
        available: response.status < 400,
        error: response.status >= 400 ? `WHIP endpoint returned ${response.status}` : undefined
      };
    } catch (error) {
      console.error('🔍 [SRS] WHIP test failed:', error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runFullDiagnostics(streamKey: string): Promise<void> {
    console.log('🔍 [SRS] Running full diagnostics for stream:', streamKey);
    
    const serverStatus = await this.checkServerStatus();
    console.log('🔍 [SRS] Server Status:', serverStatus);
    
    if (!serverStatus.isRunning) {
      console.error('🔍 [SRS] Server is not running!');
      return;
    }

    const whipTest = await this.testWhipEndpoint(streamKey);
    console.log('🔍 [SRS] WHIP Test:', whipTest);
    
    const streamCheck = await this.checkStreamExists(streamKey);
    console.log('🔍 [SRS] Stream Check:', streamCheck);
    
    if (!streamCheck.exists) {
      console.warn('🔍 [SRS] Stream does not exist - studio may not be publishing');
    } else if (!streamCheck.isLive) {
      console.warn('🔍 [SRS] Stream exists but HLS is not available');
    } else {
      console.log('🔍 [SRS] ✅ Stream is live and HLS is available!');
    }
  }
}