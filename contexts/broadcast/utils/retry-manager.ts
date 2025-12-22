export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class RetryManager {
  private attempts = 0;
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      ...config
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: Error) => boolean
  ): Promise<T> {
    this.attempts = 0;

    while (this.attempts < this.config.maxAttempts) {
      try {
        const result = await operation();
        this.reset();
        return result;
      } catch (error) {
        this.attempts++;
        
        if (this.attempts >= this.config.maxAttempts) {
          throw error;
        }

        if (shouldRetry && !shouldRetry(error as Error)) {
          throw error;
        }

        await this.delay();
      }
    }

    throw new Error('Max retry attempts exceeded');
  }

  private async delay(): Promise<void> {
    const delay = this.calculateDelay();
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private calculateDelay(): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, this.attempts - 1);
    delay = Math.min(delay, this.config.maxDelay);

    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  reset(): void {
    this.attempts = 0;
  }

  getAttempts(): number {
    return this.attempts;
  }
}