class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const msToWait = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, msToWait));
    }
    
    this.requests.push(now);
  }
}

export const aiRateLimiter = new RateLimiter(60, 60000); // 60 requests per minute