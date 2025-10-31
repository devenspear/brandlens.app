// API Request/Response Logger
export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
}

class ApiLogger {
  private logs: ApiLog[] = [];
  private maxLogs = 100;

  logRequest(method: string, url: string, body?: any): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const log: ApiLog = {
      id,
      timestamp: new Date().toISOString(),
      method,
      url,
      requestBody: body,
    };

    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return id;
  }

  logResponse(id: string, status: number, duration: number, body?: any) {
    const log = this.logs.find(l => l.id === id);
    if (log) {
      log.status = status;
      log.duration = duration;
      log.responseBody = body;
    }
  }

  logError(id: string, error: string) {
    const log = this.logs.find(l => l.id === id);
    if (log) {
      log.error = error;
      log.status = 500;
    }
  }

  getLogs(limit = 50): ApiLog[] {
    return this.logs.slice(0, limit);
  }

  getLog(id: string): ApiLog | undefined {
    return this.logs.find(l => l.id === id);
  }

  clear() {
    this.logs = [];
  }

  getStats() {
    const now = Date.now();
    const last5Min = this.logs.filter(log =>
      now - new Date(log.timestamp).getTime() < 5 * 60 * 1000
    );

    return {
      total: this.logs.length,
      last5Minutes: last5Min.length,
      errors: this.logs.filter(l => l.error || (l.status && l.status >= 400)).length,
      averageDuration: this.logs.reduce((sum, log) => sum + (log.duration || 0), 0) / this.logs.length || 0,
      byStatus: this.logs.reduce((acc, log) => {
        if (log.status) {
          acc[log.status] = (acc[log.status] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>),
    };
  }
}

export const apiLogger = new ApiLogger();
