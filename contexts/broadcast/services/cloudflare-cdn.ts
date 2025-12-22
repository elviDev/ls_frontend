export interface CloudflareCDNConfig {
  zoneId: string;
  apiToken: string;
  domain: string;
}

export interface CDNStats {
  requests: number;
  bandwidth: number;
  cacheHitRate: number;
  threats: number;
}

export class CloudflareCDNService {
  private config: CloudflareCDNConfig;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: CloudflareCDNConfig) {
    this.config = config;
  }

  async getAnalytics(since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<CDNStats> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}/analytics/dashboard?since=${since.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Cloudflare analytics');
      }

      const data = await response.json();
      const totals = data.result.totals;

      return {
        requests: totals.requests.all || 0,
        bandwidth: totals.bandwidth.all || 0,
        cacheHitRate: totals.requests.cached / totals.requests.all * 100 || 0,
        threats: totals.threats.all || 0
      };
    } catch (error) {
      throw new Error(`Cloudflare API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async purgeCache(urls?: string[]): Promise<boolean> {
    try {
      const body = urls ? { files: urls } : { purge_everything: true };
      
      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getZoneStatus(): Promise<'active' | 'pending' | 'initializing' | 'moved' | 'deleted' | 'deactivated'> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch zone status');
      }

      const data = await response.json();
      return data.result.status;
    } catch (error) {
      return 'deactivated';
    }
  }

  getStreamUrl(streamKey: string): string {
    return `https://${this.config.domain}/live/${streamKey}.m3u8`;
  }
}