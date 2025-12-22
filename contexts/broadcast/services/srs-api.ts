export interface SRSStats {
  server: {
    pid: number;
    ppid: number;
    srs_uptime: number;
  };
  streams: {
    live: number;
    clients: number;
  };
  system: {
    cpu_percent: number;
    mem_percent: number;
    mem_kbyte: number;
  };
}

export interface SRSStream {
  id: string;
  name: string;
  vhost: string;
  app: string;
  stream: string;
  param: string;
  clients: number;
  frames: number;
  send_bytes: number;
  recv_bytes: number;
  kbps: {
    recv_30s: number;
    send_30s: number;
  };
}

export class SRSApiService {
  private baseUrl: string;

  constructor(srsUrl: string) {
    const url = new URL(srsUrl);
    url.port = '1985';
    this.baseUrl = url.toString().replace(/\/$/, ''); // Remove trailing slash
  }

  async getStats(): Promise<SRSStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/summaries`);
      if (!response.ok) {
        throw new Error('Failed to fetch SRS stats');
      }
      return await response.json();
    } catch (error) {
      throw new Error(`SRS API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStreams(): Promise<SRSStream[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/streams/`);
      if (!response.ok) {
        throw new Error('Failed to fetch SRS streams');
      }
      const data = await response.json();
      return data.streams || [];
    } catch (error) {
      throw new Error(`SRS API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStreamInfo(streamId: string): Promise<SRSStream | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/streams/${streamId}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.stream || null;
    } catch (error) {
      return null;
    }
  }

  async kickStream(streamId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/streams/${streamId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getWebRTCPublishUrl(streamKey: string): string {
    return `${this.baseUrl.replace(':1985', '')}/rtc/v1/whip/?app=live&stream=${streamKey}`;
  }

  getWebRTCPlayUrl(streamKey: string): string {
    return `${this.baseUrl.replace(':1985', '')}/rtc/v1/whep/?app=live&stream=${streamKey}`;
  }

  getHLSPlayUrl(streamKey: string): string {
    console.log('🎵 [SRSApi] getHLSPlayUrl called with streamKey:', streamKey);
    const baseUrlWithoutPort = this.baseUrl.replace(':1985', '');
    const url = `${baseUrlWithoutPort}/live/${streamKey}.m3u8`;
    console.log('🎵 [SRSApi] Generated HLS URL:', url);
    return url;
  }

  async isServerHealthy(): Promise<boolean> {
    try {
      const stats = await this.getStats();
      return stats.server.pid > 0;
    } catch (error) {
      return false;
    }
  }
}